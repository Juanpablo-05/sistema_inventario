import { db } from "../../db/db";
import { Request, Response } from "express";

export async function getProducts(_req: Request, res: Response) {
  
  const query = `
    SELECT id_p, 
    nombre_p, 
    precio_p, 
    fecha_agregado_p, 
    fecha_caducidad_p, 
    stock_actual, 
    created_at_p, 
    updated_at_p, 
    nombre
    FROM productos AS p
    INNER JOIN 
    categorias AS c
    ON
    p.Id_categoria_PK = c.id
    `;

  try {
    const [rows] = await db.promise().query(query);
    res.status(200).json({ rows });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos", details: error instanceof Error ? error.message : String(error) });
  }
}
