import {db} from "../../db/db";
import { Request, Response } from "express";


export async function getCategori(req: Request, res: Response) {

    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM categorias"
        );
        res.status(200).json({ categorias: rows });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las categorías" });
    }
}