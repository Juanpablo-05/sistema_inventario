import { db } from "../../db/db";
import { Request, Response } from "express";
import { inventoriMovTypeCreate } from "./types/Types";
import { AuthRequest } from "../../middleware/Auth";

import { toMysqlDateTime, normalizeDateOnly } from "../utils/Normalize"; 

export async function createInventoryMov(req: Request, res: Response) { 

    const { 
        Id_producto_PK,
        tipo,
        cantidad,
        fecha_movimiento,
        motivo,
        usuario_id,
        origen_tipo,
        origen_id
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

    const motivoText = typeof motivo === "string" ? motivo.trim() : "";
    if (!motivoText) {
        return res.status(400).json({ error: "Motivo inválido, debe ser una cadena de texto no vacía" });
    }

    const authUserId = Number((req as AuthRequest).user?.id ?? 0);
    const usuarioId = Number(usuario_id ?? authUserId);
    if (Number.isNaN(usuarioId) || usuarioId <= 0) {
        return res.status(400).json({ error: "usuario_id inválido" });
    }

    const origenTipoValue = origen_tipo ?? "admin";
    if (origenTipoValue !== "admin" && origenTipoValue !== "venta" && origenTipoValue !== "anulacion") {
        return res.status(400).json({ error: "origen_tipo inválido (admin | venta | anulacion)" });
    }

    const origenIdValue = origen_id === undefined || origen_id === null ? null : Number(origen_id);
    if (origenIdValue !== null && (Number.isNaN(origenIdValue) || origenIdValue <= 0)) {
        return res.status(400).json({ error: "origen_id inválido" });
    }

    if ((origenTipoValue === "venta" || origenTipoValue === "anulacion") && origenIdValue === null) {
        return res.status(400).json({ error: "origen_id es obligatorio para origen_tipo venta o anulacion" });
    }

    try {
        const fechaMovDb = toMysqlDateTime(fechaMov);
        const conn = await db.promise().getConnection();
        try {
            await conn.beginTransaction();

            const [rows] = await conn.query(
                "SELECT stock_actual FROM productos WHERE id_p = ? FOR UPDATE",
                [productoId],
            );
            const rowList = rows as Array<{ stock_actual: number }>;
            if (rowList.length === 0) {
                await conn.rollback();
                return res.status(404).json({ error: "Producto no encontrado" });
            }

            const [userRows] = await conn.query(
                "SELECT id FROM usuarios WHERE id = ? LIMIT 1",
                [usuarioId],
            );
            const userList = userRows as Array<{ id: number }>;
            if (userList.length === 0) {
                await conn.rollback();
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            if (origenIdValue !== null && (origenTipoValue === "venta" || origenTipoValue === "anulacion")) {
                const [billingRows] = await conn.query(
                    "SELECT id FROM facturas WHERE id = ? LIMIT 1",
                    [origenIdValue],
                );
                const billingList = billingRows as Array<{ id: number }>;
                if (billingList.length === 0) {
                    await conn.rollback();
                    return res.status(404).json({ error: "Factura de origen no encontrada" });
                }
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
                    (Id_Produ_PK, tipo, cantidad, fecha_movimiento, motivo, stock_anterior, stock_nuevo, usuario_id, origen_tipo, origen_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    productoId,
                    tipo,
                    NumCantidad,
                    fechaMovDb,
                    motivoText,
                    stockActual,
                    stockNuevo,
                    usuarioId,
                    origenTipoValue,
                    origenIdValue,
                ],
            );

            await conn.query(
                "UPDATE productos SET stock_actual = ?, updated_at_p = NOW() WHERE id_p = ?",
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
