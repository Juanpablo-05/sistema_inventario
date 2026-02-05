import { db } from "../../db/db";
import { Request, Response } from "express";

export async function createCategori(req: Request, res: Response) { 

    const { nombre } = req.body;
    if (!nombre || typeof nombre !== "string") {
        return res.status(400).json({ error: "Nombre de categoría inválido" });
    }

    try {
        const [result] = await db.promise().query(
            "INSERT INTO categorias (nombre) VALUES (?)",
            [nombre]
        );
        res.status(201).json({ message: "Categoría creada exitosamente", result });
    } catch (error) {
        res.status(500).json({ error: "Error al crear la categoría" });
    }
}


