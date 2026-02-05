import { db } from "../../db/db";
import { Request, Response } from "express";
import {Campos} from "./types/Types"


function isValidDateString(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export async function createProduct(req: Request, res: Response) {
    const {
        nombre,
        precio,
        fecha_agregado,
        fecha_caducidad,
        Id_categoria_PK
    }: Campos = req.body;

    const precioNumber = Number(precio);
    if (Number.isNaN(precioNumber) || precioNumber < 0) {
        return res.status(400).json({ error: "Precio inválido" });
    }

    if (!fecha_agregado || typeof fecha_agregado !== "string" || !isValidDateString(fecha_agregado)) {
        return res.status(400).json({ error: "fecha_agregado inválida (YYYY-MM-DD)" });
    }

    if (!fecha_caducidad || typeof fecha_caducidad !== "string" || !isValidDateString(fecha_caducidad)) {
        return res.status(400).json({ error: "fecha_caducidad inválida (YYYY-MM-DD)" });
    }

    const categoriaId = Number(Id_categoria_PK);
    if (Number.isNaN(categoriaId) || categoriaId <= 0) {
        return res.status(400).json({ error: "Id_categoria_PK inválido" });
    }

    try {
        const [result] = await db.promise().query(
        "INSERT INTO productos (nombre, precio, fecha_agregado, fecha_caducidad, Id_categoria_PK) VALUES (?, ?, ?, ?, ?)",
        [nombre, precioNumber, fecha_agregado, fecha_caducidad, categoriaId]
        );
        res.status(201).json({ message: "Producto creado exitosamente", result });
    } catch (error) {
        res.status(500).json({ error: "Error al crear el producto" });
    }
}
