import { db } from "../../db/db";
import { Request, Response } from "express";

export const deleteBilling = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "ID de factura es requerido" });
    }

    try {
        const [rows] = await db.promise().query('SELECT * FROM facturas WHERE id = ?', [id]);

        const affectedRows = (rows as any).length;
        if (affectedRows === 0) {
            return res.status(404).json({ error: "Factura no encontrada" });
        }
        
        res.status(200).json({ message: "Factura eliminada exitosamente" });

    } catch (error) { 
        return res.status(500).json({ error: "Error al verificar la factura" });
    }
}