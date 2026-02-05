import { db } from "../../db/db";
import { Request, Response } from "express";

export async function getProducts(_req: Request, res: Response) {
  try {
    const [rows] = await db.promise().query("SELECT * FROM productos");
    res.status(200).json({ productos: rows });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos" });
  }
}
