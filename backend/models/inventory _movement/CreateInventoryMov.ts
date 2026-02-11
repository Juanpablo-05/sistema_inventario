import { db } from "../../db/db";
import { Request, Response } from "express";
import { inventoriMovTypeCreate } from "./types/Types";

import { toMysqlDateTime, normalizeDateOnly } from "../utils/Normalize"; // Reutilizamos la función de normalización de fechas

export async function createInventoryMov(req: Request, res: Response) { 

    const { 
        Id_producto_PK,
        tipo,
        cantidad,
        fecha_movimiento,
        motivo
    }: inventoriMovTypeCreate = req.body 

    // se asegura que cantidad sea un número positivo
    const NumCantidad = Number(cantidad);

    if(!NumCantidad || NumCantidad <= 0){
        return res.status(400).json({ error: "Cantidad inválida, debe ser un número positivo" });
    }

    //validar que fecha_movimiento sea una fecha válida
    const fechaMov = normalizeDateOnly(fecha_movimiento);
    if (!fechaMov) {
        return res.status(400).json({ error: "Fecha de movimiento inválida (YYYY-MM-DD)" });
    }

    // Validación de datos
    const productoId = Number(Id_producto_PK);
    if (Number.isNaN(productoId) || productoId <= 0) {
        return res.status(400).json({ error: "ID de producto inválido" });
    }

    if (!tipo || (tipo !== "entrada" && tipo !== "salida" && tipo !== "ajuste")) { 
        return res.status(400).json({ error: "Tipo de movimiento inválido (entrada | salida | ajuste)" });
    }

    if (!motivo || typeof motivo !== "string") {
        return res.status(400).json({ error: "Motivo inválido, debe ser una cadena de texto" });
    }

    try {
        const fechaMovDb = toMysqlDateTime(fechaMov);
        const conn = await db.promise().getConnection();
        try {
            await conn.beginTransaction();

            const [rows] = await conn.query(
                "SELECT stock_actual FROM productos WHERE id = ? FOR UPDATE",
                [productoId],
            );
            const rowList = rows as Array<{ stock_actual: number }>;
            if (rowList.length === 0) {
                await conn.rollback();
                return res.status(404).json({ error: "Producto no encontrado" });
            }

            const stockActual = Number(rowList[0].stock_actual ?? 0);
            let stockNuevo = stockActual;

            if (tipo === "entrada") {
                stockNuevo = stockActual + NumCantidad;
            } else if (tipo === "salida") {
                stockNuevo = stockActual - NumCantidad;
            } else if (tipo === "ajuste") {
                stockNuevo = NumCantidad;
            }

            if (stockNuevo < 0) {
                await conn.rollback();
                return res.status(400).json({ error: "Stock insuficiente" });
            }

            await conn.query(
                `INSERT INTO movimientos_inventario
                    (Id_Produ_PK, tipo, cantidad, fecha_movimiento, motivo, stock_anterior, stock_nuevo)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [productoId, tipo, NumCantidad, fechaMovDb, motivo, stockActual, stockNuevo],
            );

            await conn.query(
                "UPDATE productos SET stock_actual = ?, updated_at = NOW() WHERE id = ?",
                [stockNuevo, productoId],
            );

            await conn.commit();
            return res.status(201).json({
                message: "Movimiento de inventario creado exitosamente",
                stock_anterior: stockActual,
                stock_nuevo: stockNuevo,
            });
        } catch (txError) {
            await conn.rollback();
            return res.status(500).json({ error: "Error al crear movimiento de inventario", details: txError });
        } finally {
            conn.release();
        }
    } catch (error) {
        return res.status(500).json({ error: "Error al crear movimiento de inventario", details: error });
    }

} 
