import { Request, Response } from "express";
import { PoolConnection } from "mysql2/promise";
import { db } from "../../db/db";
import { BillingDetailCreateFields } from "./types/Types";

export async function createBillingDetails(req: Request, res: Response) {
    const {
        factura_id,
        producto_id,
        cantidad,
        precio_unitario,
        descuento,
        impuesto_linea,
        total_linea
    }: BillingDetailCreateFields = req.body;
    
    const facturaId = Number(factura_id);
    const productoId = Number(producto_id);
    const cantidadNum = Number(cantidad);
    const precioUnitarioNum = Number(precio_unitario);
    const descuentoNum = descuento === undefined ? 0 : Number(descuento);
    const impuestoLineaNum = impuesto_linea === undefined ? 0 : Number(impuesto_linea);
    const totalLineaNum = total_linea === undefined ? undefined : Number(total_linea);

    if (Number.isNaN(facturaId) || facturaId <= 0) {
        return res.status(400).json({ error: "factura_id inválido" });
    }
    if (Number.isNaN(productoId) || productoId <= 0) {
        return res.status(400).json({ error: "producto_id inválido" });
    }
    if (Number.isNaN(cantidadNum) || !Number.isInteger(cantidadNum) || cantidadNum <= 0) {
        return res.status(400).json({ error: "cantidad inválida, debe ser un entero positivo" });
    }
    if (Number.isNaN(precioUnitarioNum) || precioUnitarioNum < 0) {
        return res.status(400).json({ error: "precio_unitario inválido" });
    }
    if (Number.isNaN(descuentoNum) || descuentoNum < 0) {
        return res.status(400).json({ error: "descuento inválido" });
    }
    if (Number.isNaN(impuestoLineaNum) || impuestoLineaNum < 0) {
        return res.status(400).json({ error: "impuesto_linea inválido" });
    }

    const subtotalLinea = precioUnitarioNum * cantidadNum - descuentoNum;
    if (subtotalLinea < 0) {
        return res.status(400).json({ error: "El descuento no puede ser mayor al subtotal de la línea" });
    }

    const totalLineaFinal = totalLineaNum === undefined ? subtotalLinea + impuestoLineaNum : totalLineaNum;
    if (Number.isNaN(totalLineaFinal) || totalLineaFinal < 0) {
        return res.status(400).json({ error: "total_linea inválido" });
    }

    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();

        const [facturaRows] = await conn.query(
            "SELECT id, estado FROM facturas WHERE id = ? FOR UPDATE",
            [facturaId],
        );
        const facturaList = facturaRows as Array<{ id: number; estado: "emitida" | "anulada" }>;
        if (facturaList.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: "Factura no encontrada" });
        }
        if (facturaList[0].estado === "anulada") {
            await conn.rollback();
            return res.status(400).json({ error: "No se pueden agregar detalles a una factura anulada" });
        }

        const [productoRows] = await conn.query("SELECT id_p FROM productos WHERE id_p = ? LIMIT 1", [productoId]);
        const productoList = productoRows as Array<{ id_p: number }>;
        if (productoList.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        const [result] = await conn.query(
            `INSERT INTO factura_detalle
                (factura_id, producto_id, cantidad, precio_unitario, descuento, impuesto_linea, total_linea)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                facturaId,
                productoId,
                cantidadNum,
                precioUnitarioNum,
                descuentoNum,
                impuestoLineaNum,
                totalLineaFinal,
            ],
        );
        const insertId = Number((result as { insertId?: number }).insertId ?? 0);

        await recalculateFacturaTotals(conn, facturaId);
        await conn.commit();

        return res.status(201).json({
            message: "Detalle de factura creado correctamente",
            billing_detail_id: insertId,
            factura_id: facturaId,
        });
    } catch (error) {
        await conn.rollback();
        return res.status(500).json({ error: "Error al crear detalle de factura", details: error });
    } finally {
        conn.release();
    }
}

async function recalculateFacturaTotals(conn: PoolConnection, facturaId: number): Promise<void> {
    const [sumRows] = await conn.query(
        `SELECT
            COALESCE(SUM((precio_unitario * cantidad) - descuento), 0) AS subtotal,
            COALESCE(SUM(impuesto_linea), 0) AS impuesto,
            COALESCE(SUM(total_linea), 0) AS total
         FROM factura_detalle
         WHERE factura_id = ?`,
        [facturaId],
    );

    const totals = (sumRows as Array<{ subtotal: number | string; impuesto: number | string; total: number | string }>)[0];
    const subtotal = Number(totals?.subtotal ?? 0);
    const impuesto = Number(totals?.impuesto ?? 0);
    const total = Number(totals?.total ?? 0);

    await conn.query(
        "UPDATE facturas SET subtotal = ?, impuesto = ?, total = ?, updated_at = NOW() WHERE id = ?",
        [subtotal, impuesto, total, facturaId],
    );
}
