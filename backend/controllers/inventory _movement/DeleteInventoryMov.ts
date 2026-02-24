import { db } from "../../db/db";
import { Request, Response } from "express";

export async function deleteInventoryMov(req: Request, res: Response) { 

    const { id } = req.params;
    const movId = Number(id);
    if (Number.isNaN(movId) || movId <= 0) { 
        return res.status(400).json({ error: "ID de movimiento inválido" });
    }

    try {
        const conn = await db.promise().getConnection();
        try {
            await conn.beginTransaction();

            const [movRows] = await conn.query(
                "SELECT id FROM movimientos_inventario WHERE id = ? FOR UPDATE",
                [movId],
            );
            const movList = movRows as Array<{ id: number }>;
            if (movList.length === 0) {
                await conn.rollback();
                return res.status(404).json({ error: "Movimiento no encontrado" });
            }

            await conn.query("DELETE FROM movimientos_inventario WHERE id = ?", [movId]);

            await conn.commit();
            res.status(200).json({ message: "Movimiento eliminado correctamente" });
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    } catch (error) {
        console.error("Error al eliminar movimiento de inventario:", error);
        res.status(500).json({ error: "Error al eliminar movimiento de inventario", details: error });
    }
}
