import { db } from "../../db/db";
import { Request, Response } from "express";  

export async function editCategori(req: Request, res: Response) { 

    const { id } = req.params;
    const categoriId = Number(id);
    if (isNaN(categoriId) || categoriId <= 0) {
        return res.status(400).json({ error: "ID de categoría inválido" });
    }

    const { nombre } = req.body;
    if (!nombre || typeof nombre !== "string") {
        return res.status(400).json({ error: "Nombre de categoría inválido" });
    }

    try {
        const [result] = await db.promise().query(
            "UPDATE categorias SET nombre = ? WHERE id = ?",
            [nombre, categoriId]
        );
        const updateResult = result as { affectedRows: number };
        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        res.status(200).json({ message: "Categoría actualizada exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la categoría" });
    }
}