import { db } from "../../db/db";
import { Request, Response } from "express";

export async function getBillingDetails(req: Request, res: Response) {
  const { facturaId } = req.params;
  const facturaIdNum = Number(facturaId);
  if (Number.isNaN(facturaIdNum) || facturaIdNum <= 0) {
    return res.status(400).json({ error: "ID de factura inválido" });
  }

  try {
    const [rows] = await db.promise().query(
      `SELECT
        fd.id,
        fd.factura_id,
        fd.producto_id,
        p.nombre_p AS producto_nombre,
        fd.cantidad,
        fd.precio_unitario,
        fd.descuento,
        fd.impuesto_linea,
        fd.total_linea,
        fd.created_at,
        fd.updated_at
    FROM
        factura_detalle AS fd
        INNER JOIN productos AS p ON p.id_p = fd.producto_id
    WHERE
        fd.factura_id = ?
    ORDER BY fd.id DESC;`,
      [facturaIdNum],
    );

    return res.status(200).json({ billing_details: rows });
  } catch (error) {
    return res
      .status(500)
      .json({
        error: "Error al obtener los detalles de la factura",
        details: error,
      });
  }
}
