import { db } from "../../db/db";
import { Request, Response } from "express";

export async function editCategori(req: Request, res: Response) {
    const { id } = req.params;
    const categoriId = Number(id);
    
    // Validación de ID de categoría, asegurando que sea un número positivo
    if (isNaN(categoriId) || categoriId <= 0) {
        return res.status(400).json({ error: "ID de categoría inválido" });
    }

    const { nombre, descripcion, estado } = req.body as {
        nombre?: string;
        descripcion?: string;
        estado?: "activo" | "inactivo";
    };

    // Validación de datos de actualización, permitiendo campos opcionales pero validando su formato si están presentes

    if (nombre !== undefined && typeof nombre !== "string") {
        return res.status(400).json({ error: "Nombre de categoría inválido" });
    }

    if (descripcion !== undefined && typeof descripcion !== "string") {
        return res.status(400).json({ error: "Descripción de categoría inválida" });
    }

    if (estado !== undefined && estado !== "activo" && estado !== "inactivo") {
        return res.status(400).json({ error: "Estado de categoría inválido" });
    }
    try {
        const [result] = await db
            .promise()
            .query(
                "UPDATE categorias SET nombre = COALESCE(?, nombre), descripcion = COALESCE(?, descripcion), estado = COALESCE(?, estado), updated_at = NOW() WHERE id = ?",
                [nombre ?? null, descripcion ?? null, estado ?? null, categoriId],
            );
        const updateResult = result as { affectedRows: number };
        console.log("Request data:", req.body);
        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ error: "Categoría no encontrada" });
            
        }
        res.status(200).json({ message: `categoria actualizada exitosamente ${req.body}` });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la categoría" });
    }
}
