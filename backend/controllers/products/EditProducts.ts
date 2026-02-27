import { db } from "../../db/db";
import { CamposUpdateProducts } from "./types/Types";
import { Request, Response } from "express";
import { normalizeDateOnly, toMysqlDateTime } from "../utils/Normalize";

export async function editProduct(req: Request, res: Response) {
    const { id } = req.params;
    const productId = Number(id);

    // Validar que el ID del producto sea un número entero positivo
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

    // Validación de campos (solo si están presentes en el cuerpo de la solicitud)

    if (nombre !== undefined && typeof nombre !== "string") {
        return res.status(400).json({ error: "Nombre de producto inválido" });
    }

    const precioNumber = precio !== undefined ? Number(precio) : null;
    if (precioNumber !== null && (Number.isNaN(precioNumber) || precioNumber < 0)) {
        return res.status(400).json({ error: "Precio inválido" });
    }

    // Validar que las fechas sean válidas y que la fecha de caducidad no sea anterior a la fecha de agregado

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

    // Validar que Id_categoria_PK sea un número entero positivo

    const categoriaId = Id_categoria_PK !== undefined ? Number(Id_categoria_PK) : null;
    if (categoriaId !== null && (Number.isNaN(categoriaId) || categoriaId <= 0)) {
        return res.status(400).json({ error: "Id_categoria_PK inválido" });
    }


    // Validar que stock_actual sea un número entero no negativo
    const stockNumber = stock_actual !== undefined ? Number(stock_actual) : null;
    if (stockNumber !== null && (Number.isNaN(stockNumber) || stockNumber < 0)) {
        return res.status(400).json({ error: "stock_actual inválido" });
    }

    try {
        const fechaAgDb = fechaAg ? toMysqlDateTime(fechaAg) : null;
        const fechaCadDb = fechaCad ? toMysqlDateTime(fechaCad) : null;
        const [result] = await db.promise().query(
        "UPDATE productos SET nombre_p = COALESCE(?, nombre_p), precio_p = COALESCE(?, precio_p), fecha_agregado_P = COALESCE(?, fecha_agregado_p), fecha_caducidad_p = COALESCE(?, fecha_caducidad_p), stock_actual = COALESCE(?, stock_actual), Id_categoria_PK = COALESCE(?, Id_categoria_PK), updated_at_p = NOW() WHERE id_p = ?",
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
        res.status(500).json({ error: "Error al actualizar el producto", details: error instanceof Error ? error.message : "Error desconocido" });
        console.log(req.body + " " + error);
    }
}
