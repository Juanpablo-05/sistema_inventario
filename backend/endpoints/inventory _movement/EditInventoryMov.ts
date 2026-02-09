import { db } from "../../db/db";
import { Request, Response } from "express";
import { toMysqlDateTime, normalizeDateOnly } from "../utils/Normalize";
import {inventoriMovTypeUpdate} from "./types/Types";

export async function editInventoryMov(req: Request, res: Response) { 
    const { id } = req.params;
    const movId = Number(id);
    if (Number.isNaN(movId) || movId <= 0) {
        return res.status(400).json({ error: "ID de movimiento inválido" });
    }

    const {
        Id_producto_PK,
        tipo, cantidad,
        fecha_movimiento,
        motivo
    }: inventoriMovTypeUpdate
        = req.body;

    if (Id_producto_PK !== undefined && (!Number.isInteger(Id_producto_PK) || Id_producto_PK <= 0)) {
        return res.status(400).json({ error: "ID de producto inválido" });
    }

    if (tipo !== undefined && tipo !== "entrada" && tipo !== "salida" && tipo !== "ajuste") {
        return res.status(400).json({ error: "Tipo de movimiento inválido (entrada | salida | ajuste)" });
    }

    if (cantidad !== undefined && (!Number.isInteger(cantidad) || cantidad <= 0)) {
        return res.status(400).json({ error: "Cantidad inválida, debe ser un número entero positivo" });
    }

    let fechaMovDb: string | null = null;
    if (fecha_movimiento !== undefined) {
        const fechaMov = normalizeDateOnly(fecha_movimiento);
        if (!fechaMov) {
            return res.status(400).json({ error: "Fecha de movimiento inválida (YYYY-MM-DD)" });
        }
        fechaMovDb = toMysqlDateTime(fechaMov);
    }

    if (motivo !== undefined && typeof motivo !== "string") {
        return res.status(400).json({ error: "Motivo inválido, debe ser una cadena de texto" });
    }

    if (
        Id_producto_PK === undefined &&
        tipo === undefined &&
        cantidad === undefined &&
        fecha_movimiento === undefined &&
        motivo === undefined
    ) {
        return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();

        const [movRows] = await conn.query(
            `
                SELECT id, Id_Produ_PK, tipo, cantidad, fecha_movimiento, motivo, stock_anterior,  stock_nuevo
                FROM movimientos_inventario
                WHERE id = ? FOR UPDATE
            `,
            [movId],
        );
        const movList = movRows as Array<{
            id: number;
            Id_Produ_PK: number;
            tipo: "entrada" | "salida" | "ajuste";
            cantidad: number;
            fecha_movimiento: string;
            motivo: string;
            stock_anterior: number;
            stock_nuevo: number;
        }>;
        if (movList.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: "Movimiento no encontrado" });
        }

        const current = movList[0];
        const oldProductId = Number(current.Id_Produ_PK);
        const newProductId = Id_producto_PK ?? oldProductId;
        const newTipo = tipo ?? current.tipo;
        const newCantidad = cantidad ?? Number(current.cantidad);
        const newMotivo = motivo ?? current.motivo;
        const newFechaMov = fechaMovDb ?? current.fecha_movimiento;

        const oldDelta = Number(current.stock_nuevo) - Number(current.stock_anterior);

        if (newProductId === oldProductId) {
            const [prodRows] = await conn.query(
                "SELECT stock_actual FROM productos WHERE id = ? FOR UPDATE",
                [oldProductId],
            );
            const prodList = prodRows as Array<{ stock_actual: number }>;
            if (prodList.length === 0) {
                await conn.rollback();
                return res.status(404).json({ error: "Producto no encontrado" });
            }

            const stockCurrent = Number(prodList[0].stock_actual ?? 0);
            const stockBase = stockCurrent - oldDelta;
            if (stockBase < 0) {
                await conn.rollback();
                return res.status(400).json({ error: "Stock inconsistente al revertir el movimiento" });
            }

            const stockNuevo = computeStock(stockBase, newTipo, newCantidad);
            if (stockNuevo < 0) {
                await conn.rollback();
                return res.status(400).json({ error: "Stock insuficiente" });
            }

            await conn.query(
                `UPDATE movimientos_inventario
                 SET Id_Produ_PK = ?, tipo = ?, cantidad = ?, fecha_movimiento = ?, motivo = ?, stock_anterior = ?, stock_nuevo = ?
                 WHERE id = ?`,
                [newProductId, newTipo, newCantidad, newFechaMov, newMotivo, stockBase, stockNuevo, movId],
            );

            await conn.query(
                "UPDATE productos SET stock_actual = ?, updated_at = NOW() WHERE id = ?",
                [stockNuevo, oldProductId],
            );
        } else {
            const [oldProdRows] = await conn.query(
                "SELECT stock_actual FROM productos WHERE id = ? FOR UPDATE",
                [oldProductId],
            );
            const oldProdList = oldProdRows as Array<{ stock_actual: number }>;
            if (oldProdList.length === 0) {
                await conn.rollback();
                return res.status(404).json({ error: "Producto anterior no encontrado" });
            }

            const [newProdRows] = await conn.query(
                "SELECT stock_actual FROM productos WHERE id = ? FOR UPDATE",
                [newProductId],
            );
            const newProdList = newProdRows as Array<{ stock_actual: number }>;
            if (newProdList.length === 0) {
                await conn.rollback();
                return res.status(404).json({ error: "Nuevo producto no encontrado" });
            }

            const stockOldCurrent = Number(oldProdList[0].stock_actual ?? 0);
            const stockOldBase = stockOldCurrent - oldDelta;
            if (stockOldBase < 0) {
                await conn.rollback();
                return res.status(400).json({ error: "Stock inconsistente al revertir el movimiento" });
            }

            const stockNewBase = Number(newProdList[0].stock_actual ?? 0);
            const stockNuevo = computeStock(stockNewBase, newTipo, newCantidad);
            if (stockNuevo < 0) {
                await conn.rollback();
                return res.status(400).json({ error: "Stock insuficiente" });
            }

            await conn.query(
                `UPDATE movimientos_inventario
                 SET Id_Produ_PK = ?, tipo = ?, cantidad = ?, fecha_movimiento = ?, motivo = ?, stock_anterior = ?, stock_nuevo = ?
                 WHERE id = ?`,
                [newProductId, newTipo, newCantidad, newFechaMov, newMotivo, stockNewBase, stockNuevo, movId],
            );

            await conn.query(
                "UPDATE productos SET stock_actual = ?, updated_at = NOW() WHERE id = ?",
                [stockOldBase, oldProductId],
            );
            await conn.query(
                "UPDATE productos SET stock_actual = ?, updated_at = NOW() WHERE id = ?",
                [stockNuevo, newProductId],
            );
        }

        await conn.commit();
        return res.status(200).json({ message: "Movimiento de inventario actualizado exitosamente" });
    } catch (error) {
        await conn.rollback();
        return res.status(500).json({ error: "Error al actualizar movimiento de inventario", details: error });
    } finally {
        conn.release();
    }

}

function computeStock(base: number, tipo: "entrada" | "salida" | "ajuste", cantidad: number): number {
    if (tipo === "entrada") return base + cantidad;
    if (tipo === "salida") return base - cantidad;
    return cantidad;
}
