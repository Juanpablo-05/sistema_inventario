import { db } from "../../db/db";
import { Request, Response } from "express";

export async function deleteUser(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    if (!userId || isNaN(Number(userId))) {
        res.status(400).json({ error: "ID de usuario inválido" });
        return;
    }
    try {
        const [result] = await db.promise().query("DELETE FROM usuarios WHERE id = ?", [userId]);
        if ((result as any).affectedRows === 0) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }
        res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar usuario", details: error instanceof Error ? error.message : String(error) });
    }
}