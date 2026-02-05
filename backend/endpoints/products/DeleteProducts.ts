import { db } from "../../db/db";
import { Request, Response } from "express";

export async function deleteProduct(req: Request, res: Response) {
  const { id } = req.params;
  const productId = Number(id);
  if (Number.isNaN(productId) || productId <= 0) {
    return res.status(400).json({ error: "ID de producto inválido" });
  }

  try {
    const [result] = await db.promise().query("DELETE FROM productos WHERE id = ?", [productId]);
    const deleteResult = result as { affectedRows: number };
    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
}
