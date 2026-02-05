import { db } from "../../db/db";
import { Request, Response } from "express";

export async function createCategori(req: Request, res: Response) { 

    const { nombre, descripcion, estado } = req.body as {
        nombre: string;
        descripcion?: string;
        estado?: "activo" | "inactivo";
    };

    if (!nombre || typeof nombre !== "string") {
        return res.status(400).json({ error: "Nombre de categoría inválido" });
    }
    if (descripcion !== undefined && typeof descripcion !== "string") {
        return res.status(400).json({ error: "Descripción de categoría inválida" });
    }
    if (!estado || (estado !== "activo" && estado !== "inactivo")) {
        return res.status(400).json({ error: "Estado inválido (activo | inactivo)" });
    }

    try {
        const [result] = await db.promise().query(
            "INSERT INTO categorias (nombre, descripcion, estado, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
            [nombre, descripcion ?? null, estado]
        );
        res.status(201).json({ message: "Categoría creada exitosamente", result });
        const updateResult = result as { affectedRows: number };
        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ error: "Faltan datos requeridos para crear la categoría" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error al crear la categoría, " + error });
    }
}


