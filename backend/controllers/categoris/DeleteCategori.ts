import { db } from "../../db/db";
import { Request, Response } from "express";

export async function deleteCategori(req: Request, res: Response) {
    const { id } = req.params;
    const categoriId = Number(id);

    // Validación de ID de categoría, asegurando que sea un número positivo
    if (isNaN(categoriId) || categoriId <= 0) {
        return res.status(400).json({ error: "ID de categoría inválido" });
    }
    try { 
        const [result] = await db.promise().query(
            "DELETE FROM categorias WHERE id = ?",
            [categoriId]
        );
        const deleteResult = result as { affectedRows: number };
        if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        res.status(200).json({ message: "Categoría eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la categoría" });
    }
}