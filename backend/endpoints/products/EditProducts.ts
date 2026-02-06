import { db } from "../../db/db";
import { CamposUpdateProducts } from "./types/Types";
import { Request, Response } from "express";

export async function editProduct(req: Request, res: Response) {
    const { id } = req.params;
    const productId = Number(id);
    if (Number.isNaN(productId) || productId <= 0) {
        return res.status(400).json({ error: "ID de producto inválido" });
    }

    const {
        nombre,
        precio,
        fecha_agregado,
        fecha_caducidad,
        Id_categoria_PK,
        stock_actual 
    }: CamposUpdateProducts = req.body

    if (nombre !== undefined && typeof nombre !== "string") {
        return res.status(400).json({ error: "Nombre de producto inválido" });
    }

    const precioNumber = precio !== undefined ? Number(precio) : null;
    if (precioNumber !== null && (Number.isNaN(precioNumber) || precioNumber < 0)) {
        return res.status(400).json({ error: "Precio inválido" });
    }

    const fechaAg = fecha_agregado !== undefined ? normalizeDateOnly(fecha_agregado) : null;
    if (fecha_agregado !== undefined && !fechaAg) {
        return res.status(400).json({ error: "fecha_agregado inválida (YYYY-MM-DD)" });
    }

    const fechaCad = fecha_caducidad !== undefined ? normalizeDateOnly(fecha_caducidad) : null;
    if (fecha_caducidad !== undefined && !fechaCad) {
        return res.status(400).json({ error: "fecha_caducidad inválida (YYYY-MM-DD)" });
    }

    if (fechaAg && fechaCad && fechaCad < fechaAg) {
        return res.status(400).json({ error: "La fecha de caducidad no puede ser anterior a la fecha de agregado" });
    }

    const categoriaId = Id_categoria_PK !== undefined ? Number(Id_categoria_PK) : null;
    if (categoriaId !== null && (Number.isNaN(categoriaId) || categoriaId <= 0)) {
        return res.status(400).json({ error: "Id_categoria_PK inválido" });
    }

    const stockNumber = stock_actual !== undefined ? Number(stock_actual) : null;
    if (stockNumber !== null && (Number.isNaN(stockNumber) || stockNumber < 0)) {
        return res.status(400).json({ error: "stock_actual inválido" });
    }

    try {
        const fechaAgDb = fechaAg ? toMysqlDateTime(fechaAg) : null;
        const fechaCadDb = fechaCad ? toMysqlDateTime(fechaCad) : null;
        const [result] = await db.promise().query(
        "UPDATE productos SET nombre = COALESCE(?, nombre), precio = COALESCE(?, precio), fecha_agregado = COALESCE(?, fecha_agregado), fecha_caducidad = COALESCE(?, fecha_caducidad), stock_actual = COALESCE(?, stock_actual), Id_categoria_PK = COALESCE(?, Id_categoria_PK), updated_at = NOW() WHERE id = ?",
            [
                nombre ?? null,
                precioNumber,
                fechaAgDb,
                fechaCadDb,
                stockNumber,
                categoriaId,
                productId
            ]
        );
        const updateResult = result as { affectedRows: number };
        if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.status(200).json({ message: "Producto actualizado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el producto" });
        console.log(req.body + " " + error);
    }
}

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
