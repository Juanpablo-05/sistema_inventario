import { db } from "../../db/db";
import { Request, Response } from "express";
import { CamposBillingCreate } from "./types/types";

export const createBilling = async (req: Request, res: Response) => { 
    const {
        numero_factura,
        usuario_id,
        cliente_nombre,
        cliente_documento,
        observaciones,
        subtotal,
        impuestos,
        total,
        estado }: CamposBillingCreate = req.body;
    
    if (!numero_factura || !usuario_id || !cliente_nombre || !cliente_documento || !subtotal || !impuestos || !total || !estado) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (estado !== 'emitida' && estado !== 'anulada') {
        return res.status(400).json({ error: 'Estado inválido, debe ser "emitida" o "anulada"' });
    }

    try {
        const [result] = await db.promise().query(
            'INSERT INTO facturas (numero_factura, usuario_id, cliente_nombre, cliente_documento, observaciones, subtotal, impuesto, total, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [numero_factura, usuario_id, cliente_nombre, cliente_documento, observaciones || null, subtotal, impuestos, total, estado]
        );
        res.status(201).json({ message: 'Factura creada', facturaId: (result as any).insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la factura', details: (error as any).message });
    }
}