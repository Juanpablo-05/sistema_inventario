import { Request, Response } from "express";
import { PoolConnection } from "mysql2/promise";
import { db } from "../../db/db";
import { AuthRequest } from "../../middleware/Auth";
import { normalizeDateOnly, toMysqlDateTime } from "../utils/Normalize";

type IssueBillingItem = {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
    impuesto_linea?: number;
};

type IssueBillingBody = {
    numero_factura?: string;
    cliente_nombre?: string;
    cliente_documento?: string;
    observaciones?: string;
    estado?: "emitida" | "anulada";
    fecha_emision?: string;
    items?: IssueBillingItem[];
};

type LockedProductRow = {
    id_p: number;
    nombre_p: string;
    stock_actual: number;
};

export async function issueBilling(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = Number(authReq.user?.id ?? 0);
    if (Number.isNaN(userId) || userId <= 0) {
        return res.status(401).json({ error: "Usuario autenticado inválido" });
    }

    const {
        numero_factura,
        cliente_nombre,
        cliente_documento,
        observaciones,
        estado,
        fecha_emision,
        items,
    }: IssueBillingBody = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "items es obligatorio y debe tener al menos un elemento" });
    }

    const invoiceState = estado ?? "emitida";
    if (invoiceState !== "emitida" && invoiceState !== "anulada") {
        return res.status(400).json({ error: "estado inválido (emitida | anulada)" });
    }

    const preparedItems = items.map((item, index) => {
        const productoId = Number(item.producto_id);
        const cantidad = Number(item.cantidad);
        const precioUnitario = Number(item.precio_unitario);
        const descuento = item.descuento === undefined ? 0 : Number(item.descuento);
        const impuestoLinea = item.impuesto_linea === undefined ? 0 : Number(item.impuesto_linea);

        return {
            index,
            productoId,
            cantidad,
            precioUnitario,
            descuento,
            impuestoLinea,
        };
    });

    for (const item of preparedItems) {
        if (Number.isNaN(item.productoId) || item.productoId <= 0) {
            return res.status(400).json({ error: `producto_id inválido en item ${item.index + 1}` });
        }
        if (Number.isNaN(item.cantidad) || !Number.isInteger(item.cantidad) || item.cantidad <= 0) {
            return res.status(400).json({ error: `cantidad inválida en item ${item.index + 1}` });
        }
        if (Number.isNaN(item.precioUnitario) || item.precioUnitario < 0) {
            return res.status(400).json({ error: `precio_unitario inválido en item ${item.index + 1}` });
        }
        if (Number.isNaN(item.descuento) || item.descuento < 0) {
            return res.status(400).json({ error: `descuento inválido en item ${item.index + 1}` });
        }
        if (Number.isNaN(item.impuestoLinea) || item.impuestoLinea < 0) {
            return res.status(400).json({ error: `impuesto_linea inválido en item ${item.index + 1}` });
        }
        const subtotalLinea = item.precioUnitario * item.cantidad - item.descuento;
        if (subtotalLinea < 0) {
            return res.status(400).json({
                error: `descuento no puede ser mayor al subtotal de la línea (item ${item.index + 1})`,
            });
        }
    }

    let fechaEmisionDb: string | undefined;
    if (fecha_emision !== undefined) {
        const normalizedDate = normalizeDateOnly(fecha_emision);
        if (!normalizedDate) {
            return res.status(400).json({ error: "fecha_emision inválida (YYYY-MM-DD)" });
        }
        fechaEmisionDb = toMysqlDateTime(normalizedDate);
    }

    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();

        const [userRows] = await conn.query(
            "SELECT id FROM usuarios WHERE id = ? LIMIT 1",
            [userId],
        );
        const userList = userRows as Array<{ id: number }>;
        if (userList.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const invoiceNumber = await resolveInvoiceNumber(conn, numero_factura);

        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        const movementDate = fechaEmisionDb ?? now;
        const detailRows: Array<{
            producto_id: number;
            cantidad: number;
            precio_unitario: number;
            descuento: number;
            impuesto_linea: number;
            total_linea: number;
            stock_anterior: number;
            stock_nuevo: number;
        }> = [];

        for (const item of preparedItems) {
            const [productRows] = await conn.query(
                "SELECT id_p, nombre_p, stock_actual FROM productos WHERE id_p = ? FOR UPDATE",
                [item.productoId],
            );
            const productList = productRows as LockedProductRow[];
            if (productList.length === 0) {
                await conn.rollback();
                return res.status(404).json({ error: `Producto no encontrado: ${item.productoId}` });
            }

            const product = productList[0];
            const stockAnterior = Number(product.stock_actual ?? 0);
            const stockNuevo = stockAnterior - item.cantidad;
            if (stockNuevo < 0) {
                await conn.rollback();
                return res.status(400).json({
                    error: `Stock insuficiente para ${product.nombre_p} (stock actual: ${stockAnterior})`,
                });
            }

            const subtotalLinea = item.precioUnitario * item.cantidad - item.descuento;
            const totalLinea = subtotalLinea + item.impuestoLinea;

            detailRows.push({
                producto_id: item.productoId,
                cantidad: item.cantidad,
                precio_unitario: item.precioUnitario,
                descuento: item.descuento,
                impuesto_linea: item.impuestoLinea,
                total_linea: totalLinea,
                stock_anterior: stockAnterior,
                stock_nuevo: stockNuevo,
            });
        }

        const subtotal = detailRows.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad - item.descuento), 0);
        const impuesto = detailRows.reduce((acc, item) => acc + item.impuesto_linea, 0);
        const total = detailRows.reduce((acc, item) => acc + item.total_linea, 0);

        const [billingInsert] = await conn.query(
            `INSERT INTO facturas
                (numero_factura, usuario_id, cliente_nombre, cliente_documento, observaciones, subtotal, impuesto, total, estado, fecha_emision)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                invoiceNumber,
                userId,
                cliente_nombre?.trim() || null,
                cliente_documento?.trim() || null,
                observaciones?.trim() || null,
                subtotal,
                impuesto,
                total,
                invoiceState,
                movementDate,
            ],
        );
        const facturaId = Number((billingInsert as { insertId?: number }).insertId ?? 0);

        for (const detail of detailRows) {
            await conn.query(
                `INSERT INTO factura_detalle
                    (factura_id, producto_id, cantidad, precio_unitario, descuento, impuesto_linea, total_linea)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    facturaId,
                    detail.producto_id,
                    detail.cantidad,
                    detail.precio_unitario,
                    detail.descuento,
                    detail.impuesto_linea,
                    detail.total_linea,
                ],
            );

            await conn.query(
                "UPDATE productos SET stock_actual = ?, updated_at_p = NOW() WHERE id_p = ?",
                [detail.stock_nuevo, detail.producto_id],
            );

            await conn.query(
                `INSERT INTO movimientos_inventario
                    (Id_Produ_PK, tipo, cantidad, fecha_movimiento, motivo, stock_anterior, stock_nuevo, usuario_id, origen_tipo, origen_id)
                 VALUES (?, 'salida', ?, ?, ?, ?, ?, ?, 'venta', ?)`,
                [
                    detail.producto_id,
                    detail.cantidad,
                    movementDate,
                    `Factura ${invoiceNumber}`,
                    detail.stock_anterior,
                    detail.stock_nuevo,
                    userId,
                    facturaId,
                ],
            );
        }

        await conn.query(
            `UPDATE usuarios
             SET
                numero_movimientos = COALESCE(numero_movimientos, 0) + ?,
                numero_facturas = COALESCE(numero_facturas, 0) + 1
             WHERE id = ?`,
            [detailRows.length, userId],
        );

        await conn.commit();
        return res.status(201).json({
            message: "Factura emitida correctamente",
            factura_id: facturaId,
            numero_factura: invoiceNumber,
            subtotal,
            impuesto,
            total,
            items: detailRows.length,
        });
    } catch (error) {
        await conn.rollback();
        const message = error instanceof Error ? error.message : "";
        if (message.includes("número de factura")) {
            return res.status(409).json({ error: message });
        }
        return res.status(500).json({ error: "Error al emitir factura", details: error });
    } finally {
        conn.release();
    }
}

async function resolveInvoiceNumber(conn: PoolConnection, requested?: string): Promise<string> {
    const requestedClean = requested?.trim();
    if (requestedClean) {
        const [existingRows] = await conn.query(
            "SELECT id FROM facturas WHERE numero_factura = ? LIMIT 1",
            [requestedClean],
        );
        const existing = existingRows as Array<{ id: number }>;
        if (existing.length > 0) {
            throw new Error("El número de factura ya existe");
        }
        return requestedClean;
    }

    for (let attempt = 0; attempt < 10; attempt += 1) {
        const candidate = generateInvoiceNumber();
        const [existingRows] = await conn.query(
            "SELECT id FROM facturas WHERE numero_factura = ? LIMIT 1",
            [candidate],
        );
        const existing = existingRows as Array<{ id: number }>;
        if (existing.length === 0) {
            return candidate;
        }
    }

    throw new Error("No se pudo generar un número de factura único");
}

function generateInvoiceNumber(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const random = String(Math.floor(Math.random() * 900) + 100);
    return `FAC-${y}${m}${d}-${hh}${mm}${ss}-${random}`;
}
