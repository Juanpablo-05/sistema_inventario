import { db } from "../../db/db";
import { Request, Response } from "express";
import { CamposBillingEdite } from "./types/Types";

export const editBilling = async (req: Request, res: Response) => { 
    const { id } = req.params;
    const { 
        numero_factura,
        usuario_id,
        cliente_nombre,
        cliente_documento,
        observaciones,
        subtotal,
        impuesto,
        total,
        estado
    }: CamposBillingEdite = req.body;

    const billingId = Number(id);

    if(numero_factura === undefined && usuario_id === undefined && cliente_nombre === undefined && cliente_documento === undefined && observaciones === undefined && subtotal === undefined && impuesto === undefined && total === undefined && estado === undefined){
        return res.status(400).json({ error: "No se proporcionaron campos para actualizar" });
    }

    if (Number.isNaN(billingId) || billingId <= 0) {
        return res.status(400).json({ error: "ID de factura inválido" });
    }

    if (numero_factura !== undefined && typeof numero_factura !== "string") {
        return res.status(400).json({ error: "Número de factura inválido" });
    }

    if (usuario_id !== undefined && (Number.isNaN(Number(usuario_id)) || Number(usuario_id) <= 0)) {
        return res.status(400).json({ error: "ID de usuario inválido" });
    }

    if (cliente_nombre !== undefined && typeof cliente_nombre !== "string") {
        return res.status(400).json({ error: "Nombre de cliente inválido" });
    }

    if (cliente_documento !== undefined && typeof cliente_documento !== "string") {
        return res.status(400).json({ error: "Documento de cliente inválido" });
    }

    if (observaciones !== undefined && typeof observaciones !== "string") {
        return res.status(400).json({ error: "Observaciones inválidas" });
    }

    if (subtotal !== undefined && (Number.isNaN(Number(subtotal)) || Number(subtotal) < 0)) {
        return res.status(400).json({ error: "Subtotal inválido" });
    }

    if (impuesto !== undefined && (Number.isNaN(Number(impuesto)) || Number(impuesto) < 0)) {
        return res.status(400).json({ error: "Impuesto inválido" });
    }

    if (total !== undefined && (Number.isNaN(Number(total)) || Number(total) < 0)) {
        return res.status(400).json({ error: "Total inválido" });
    }

    if (estado !== undefined && typeof estado !== "string") {
        return res.status(400).json({ error: "Estado inválido" });
    }

    if (estado !== undefined && estado !== "emitida" && estado !== "anulada") {
        return res.status(400).json({ error: "Estado debe ser 'emitida' o 'anulada'" });
    }
    
    try {
        
       await db.promise().query(
        'UPDATE facturas SET numero_factura = COALESCE(?, numero_factura), usuario_id = COALESCE(?, usuario_id), cliente_nombre = COALESCE(?, cliente_nombre), cliente_documento = COALESCE(?, cliente_documento), observaciones = COALESCE(?, observaciones), subtotal = COALESCE(?, subtotal), impuesto = COALESCE(?, impuesto), total = COALESCE(?, total), estado = COALESCE(?, estado) WHERE id = ?',
            [numero_factura, usuario_id, cliente_nombre, cliente_documento, observaciones, subtotal, impuesto, total, estado, id]
        );
        return res.status(200).json({ message: "Factura actualizada correctamente" });

    }catch (error) {
        return res.status(500).json({ error: 'Error al editar la factura' });
    }
}
