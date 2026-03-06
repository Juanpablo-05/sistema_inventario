import { Request, Response } from "express";
import { PoolConnection } from "mysql2/promise";
import { db } from "../../db/db";
import { BillingDetailUpdateFields } from "./types/Types";

export async function editBillingDetails(req: Request, res: Response) {
    const detailId = Number(req.params.id);
    if (Number.isNaN(detailId) || detailId <= 0) {
        return res.status(400).json({ error: "ID de detalle inválido" });
    }

    const {
        factura_id,
        producto_id,
        cantidad,
        precio_unitario,
        descuento,
        impuesto_linea,
        total_linea,
    }: BillingDetailUpdateFields = req.body;

    if (
        factura_id === undefined &&
        producto_id === undefined &&
        cantidad === undefined &&
        precio_unitario === undefined &&
        descuento === undefined &&
        impuesto_linea === undefined &&
        total_linea === undefined
    ) {
        return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    const facturaIdNum = factura_id === undefined ? undefined : Number(factura_id);
    
    const productoIdNum = producto_id === undefined ? undefined : Number(producto_id);
    
    const cantidadNum = cantidad === undefined ? undefined : Number(cantidad);
    
    const precioUnitarioNum = precio_unitario === undefined ? undefined : Number(precio_unitario);
    
    const descuentoNum = descuento === undefined ? undefined : Number(descuento);
    
    const impuestoLineaNum = impuesto_linea === undefined ? undefined : Number(impuesto_linea);
    
    const totalLineaNum = total_linea === undefined ? undefined : Number(total_linea);

    if (facturaIdNum !== undefined && (Number.isNaN(facturaIdNum) || facturaIdNum <= 0)) {
        return res.status(400).json({ error: "factura_id inválido" });
    }
    if (productoIdNum !== undefined && (Number.isNaN(productoIdNum) || productoIdNum <= 0)) {
        return res.status(400).json({ error: "producto_id inválido" });
    }
    if (cantidadNum !== undefined && (Number.isNaN(cantidadNum) || !Number.isInteger(cantidadNum) || cantidadNum <= 0)) {
        return res.status(400).json({ error: "cantidad inválida, debe ser un entero positivo" });
    }
    if (precioUnitarioNum !== undefined && (Number.isNaN(precioUnitarioNum) || precioUnitarioNum < 0)) {
        return res.status(400).json({ error: "precio_unitario inválido" });
    }
    if (descuentoNum !== undefined && (Number.isNaN(descuentoNum) || descuentoNum < 0)) {
        return res.status(400).json({ error: "descuento inválido" });
    }
    if (impuestoLineaNum !== undefined && (Number.isNaN(impuestoLineaNum) || impuestoLineaNum < 0)) {
        return res.status(400).json({ error: "impuesto_linea inválido" });
    }
    if (totalLineaNum !== undefined && (Number.isNaN(totalLineaNum) || totalLineaNum < 0)) {
        return res.status(400).json({ error: "total_linea inválido" });
    }

    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();

        const [detailRows] = await conn.query(
            `SELECT id, factura_id, producto_id, cantidad, precio_unitario, descuento, impuesto_linea, total_linea
             FROM factura_detalle
             WHERE id = ? FOR UPDATE`,
            [detailId],
        );
        const detailList = detailRows as Array<{
            id: number;
            factura_id: number;
            producto_id: number;
            cantidad: number;
            precio_unitario: number;
            descuento: number;
            impuesto_linea: number;
            total_linea: number;
        }>;
        if (detailList.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: "Detalle de factura no encontrado" });
        }

        const current = detailList[0];
        const oldFacturaId = Number(current.factura_id);
        const newFacturaId = facturaIdNum ?? oldFacturaId;
        const newProductoId = productoIdNum ?? Number(current.producto_id);
        const newCantidad = cantidadNum ?? Number(current.cantidad);
        const newPrecioUnitario = precioUnitarioNum ?? Number(current.precio_unitario);
        const newDescuento = descuentoNum ?? Number(current.descuento ?? 0);
        const newImpuestoLinea = impuestoLineaNum ?? Number(current.impuesto_linea ?? 0);

        const subtotalLinea = newPrecioUnitario * newCantidad - newDescuento;
        if (subtotalLinea < 0) {
            await conn.rollback();
            return res.status(400).json({ error: "El descuento no puede ser mayor al subtotal de la línea" });
        }

        const newTotalLinea = totalLineaNum ?? subtotalLinea + newImpuestoLinea;
        if (newTotalLinea < 0) {
            await conn.rollback();
            return res.status(400).json({ error: "total_linea inválido" });
        }

        const [facturaRows] = await conn.query(
            "SELECT id, estado FROM facturas WHERE id = ? FOR UPDATE",
            [newFacturaId],
        );
        const facturaList = facturaRows as Array<{ id: number; estado: "emitida" | "anulada" }>;
        if (facturaList.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: "Factura no encontrada" });
        }
        if (facturaList[0].estado === "anulada") {
            await conn.rollback();
            return res.status(400).json({ error: "No se pueden editar detalles en una factura anulada" });
        }

        const [productoRows] = await conn.query("SELECT id_p FROM productos WHERE id_p = ? LIMIT 1", [newProductoId]);
        const productoList = productoRows as Array<{ id_p: number }>;
        if (productoList.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        await conn.query(
            `UPDATE factura_detalle
             SET factura_id = ?, producto_id = ?, cantidad = ?, precio_unitario = ?, descuento = ?, impuesto_linea = ?, total_linea = ?
             WHERE id = ?`,
            [newFacturaId, newProductoId, newCantidad, newPrecioUnitario, newDescuento, newImpuestoLinea, newTotalLinea, detailId],
        );

        await recalculateFacturaTotals(conn, newFacturaId);
        if (newFacturaId !== oldFacturaId) {
            await recalculateFacturaTotals(conn, oldFacturaId);
        }

        await conn.commit();
        return res.status(200).json({ message: "Detalle de factura actualizado correctamente" });
    } catch (error) {
        await conn.rollback();
        return res.status(500).json({ error: "Error al editar detalle de factura", details: error });
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
