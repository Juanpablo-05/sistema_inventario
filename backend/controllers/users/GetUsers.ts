import {db} from "../../db/db";
import { Request, Response } from "express";

export async function getUsers(req: Request, res: Response): Promise<void> { 
    try { 
        const [rows] = await db.promise().query(
            "SELECT id, nombre, username, email, rol, estado, permiso_factura, numero_movimientos, numero_facturas, created_at, updated_at FROM usuarios",
        );

        res.json(rows);
    }
    catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "Error al obtener usuarios", details: error instanceof Error ? error.message : String(error) });
    }
}
