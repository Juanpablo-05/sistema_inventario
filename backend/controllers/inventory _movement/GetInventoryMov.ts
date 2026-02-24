import { db } from "../../db/db";
import { Request, Response } from "express";

export async function getInventoryMov(req: Request, res: Response) { 
    try {
       const [rows] = await db.promise().query("SELECT * FROM movimientos_inventario");
        res.status(200).json({ inventory_movements: rows });
    } catch (error) {
        res.status(500).json({ error: "Error fetching inventory movements" });
    }
}
