import { db } from "../../db/db";
import { Request, Response } from "express";

export const deleteBilling = async (req: Request, res: Response) => {
    const { id } = req.params;

    const billingId = Number(id);
    if (!id || Number.isNaN(billingId) || billingId <= 0) {
        return res.status(400).json({ error: "ID de factura es requerido" });
    }

    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();
        const [rows] = await conn.query('SELECT id FROM facturas WHERE id = ? FOR UPDATE', [billingId]);

        const exists = Array.isArray(rows) && (rows as any).length > 0;
        if (!exists) {
            await conn.rollback();
            return res.status(404).json({ error: "Factura no encontrada" });
        }

        await conn.query('DELETE FROM factura_detalle WHERE factura_id = ?', [billingId]);
        await conn.query('DELETE FROM facturas WHERE id = ?', [billingId]);

        await conn.commit();
        return res.status(200).json({ message: "Factura eliminada exitosamente" });

    } catch (error) {
        await conn.rollback();
        return res.status(500).json({ error: "Error al eliminar la factura" });
    } finally {
        conn.release();
    }
}
