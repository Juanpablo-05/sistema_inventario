import { db } from "../../db/db";
import { Request, Response } from "express";
import { CamposCreateProducts } from "./types/Types";

export async function createProduct(req: Request, res: Response) {
    const {
        nombre,
        precio,
        fecha_agregado,
        fecha_caducidad,
        stock_actual,
        Id_categoria_PK,
    }: CamposCreateProducts = req.body;

    // Validación de campos

    if (!nombre || typeof nombre !== "string") {
        return res.status(400).json({ error: "Nombre de producto inválido" });
    }

    const fechaAg = normalizeDateOnly(fecha_agregado);
    if (!fechaAg) {
        return res.status(400).json({ error: "fecha_agregado inválida (YYYY-MM-DD)" });
    }

    const fechaCad = normalizeDateOnly(fecha_caducidad);
    if (!fechaCad) {
        return res.status(400).json({ error: "fecha_caducidad inválida (YYYY-MM-DD)" });
    }

    if (fechaCad < fechaAg) {
        return res.status(400).json({ error: "La fecha de caducidad no puede ser anterior a la fecha de agregado" });
    }

    // Validar que precio sea un número positivo
    const precioNumber = Number(precio);
    if (Number.isNaN(precioNumber) || precioNumber < 0) {
        return res.status(400).json({ error: "Precio inválido" });
    }

    // Validar que Id_categoria_PK sea un número entero positivo
    const categoriaId = Number(Id_categoria_PK);
    if (Number.isNaN(categoriaId) || categoriaId <= 0) {
        return res.status(400).json({ error: "Id_categoria_PK inválido" });
    }

    // Validar que stock_actual sea un número entero no negativo
    const stock_cantity = Number(stock_actual);
    if (Number.isNaN(stock_cantity) || stock_cantity < 0 || !Number.isInteger(stock_cantity)) {
        return res.status(400).json({ error: "stock_actual inválido" });
    }

    try {
        const fechaAgDb = toMysqlDateTime(fechaAg);
        const fechaCadDb = toMysqlDateTime(fechaCad);
        const [result] = await db
            .promise()
            .query(
                "INSERT INTO productos (nombre, precio, fecha_agregado, fecha_caducidad, stock_actual, Id_categoria_PK) VALUES (?, ?, ?, ?, ?, ?)",
                [
                nombre,
                precioNumber,
                fechaAgDb,
                fechaCadDb,
                stock_cantity,
                categoriaId,
                ],
            );
        res.status(201).json({ message: "Producto creado exitosamente", result });
    } catch (error) {
        res.status(500).json({ error: "Error al crear el producto" });
        console.log(req.body + " " + error);
    }
}

// Funciones auxiliares para normalizar y validar fechas
function normalizeDateOnly(value?: string): string | null {
    if (!value || typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
    const [year, month, day] = trimmed.split("-").map(Number);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    const iso = date.toISOString().slice(0, 10);
    return iso === trimmed ? trimmed : null;
}

function toMysqlDateTime(dateOnly: string): string {
    return `${dateOnly} 00:00:00`;
}
