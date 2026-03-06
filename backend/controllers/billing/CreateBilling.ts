import { db } from "../../db/db";
import { Request, Response } from "express";
import { CamposBillingCreate } from "./types/Types";

export const createBilling = async (req: Request, res: Response) => { 
    const {
        numero_factura,
        usuario_id,
        cliente_nombre,
        cliente_documento,
        observaciones,
        subtotal,
        impuesto,
        total,
        estado }: CamposBillingCreate = req.body;
    
    if (!numero_factura || !usuario_id || !estado) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (estado !== 'emitida' && estado !== 'anulada') {
        return res.status(400).json({ error: 'Estado inválido, debe ser "emitida" o "anulada"' });
    }

    const usuarioIdNum = Number(usuario_id);
    const subtotalNum = Number(subtotal);
    const impuestoNum = Number(impuesto);
    const totalNum = Number(total);

    if (Number.isNaN(usuarioIdNum) || usuarioIdNum <= 0) {
        return res.status(400).json({ error: "usuario_id inválido" });
    }
    if (Number.isNaN(subtotalNum) || subtotalNum < 0) {
        return res.status(400).json({ error: "subtotal inválido" });
    }
    if (Number.isNaN(impuestoNum) || impuestoNum < 0) {
        return res.status(400).json({ error: "impuesto inválido" });
    }
    if (Number.isNaN(totalNum) || totalNum < 0) {
        return res.status(400).json({ error: "total inválido" });
    }

    try {
        const [result] = await db.promise().query(
            'INSERT INTO facturas (numero_factura, usuario_id, cliente_nombre, cliente_documento, observaciones, subtotal, impuesto, total, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [numero_factura, usuarioIdNum, cliente_nombre || null, cliente_documento || null, observaciones || null, subtotalNum, impuestoNum, totalNum, estado]
        );
        res.status(201).json({ message: 'Factura creada', facturaId: (result as any).insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la factura', details: (error as any).message });
    }
}
