import { Request, Response } from "express";
import { PoolConnection } from "mysql2/promise";
import { db } from "../../db/db";

export async function deleteBillingDetails(req: Request, res: Response) {
    const detailId = Number(req.params.id);
    if (Number.isNaN(detailId) || detailId <= 0) {
        return res.status(400).json({ error: "ID de detalle inválido" });
    }

    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();

        const [detailRows] = await conn.query(
            "SELECT id, factura_id FROM factura_detalle WHERE id = ? FOR UPDATE",
            [detailId],
        );
        const detailList = detailRows as Array<{ id: number; factura_id: number }>;
        if (detailList.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: "Detalle de factura no encontrado" });
        }

        const facturaId = Number(detailList[0].factura_id);

        await conn.query("DELETE FROM factura_detalle WHERE id = ?", [detailId]);
        await recalculateFacturaTotals(conn, facturaId);

        await conn.commit();
        return res.status(200).json({ message: "Detalle de factura eliminado correctamente" });
    } catch (error) {
        await conn.rollback();
        return res.status(500).json({ error: "Error al eliminar detalle de factura", details: error });
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
