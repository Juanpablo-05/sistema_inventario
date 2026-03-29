import { db } from "../../db/db";
import { Request, Response } from "express";

function isForeignKeyDeleteError(error: unknown): boolean {
    const mysqlError = error as { code?: string; errno?: number };
    return mysqlError?.code === "ER_ROW_IS_REFERENCED_2" || mysqlError?.errno === 1451;
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId) || userId <= 0) {
        res.status(400).json({ error: "ID de usuario inválido" });
        return;
    }

    const conn = await db.promise().getConnection();

    try {
        await conn.beginTransaction();

        const [result] = await conn.query("DELETE FROM usuarios WHERE id = ?", [userId]);

        if ((result as any).affectedRows === 0) {
            await conn.rollback();
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }

        await conn.commit();
        res.status(200).json({
            message: "Usuario eliminado exitosamente",
            action: "deleted",
        });
    } catch (error) {
        await conn.rollback();

        if (isForeignKeyDeleteError(error)) {
            try {
                await conn.beginTransaction();

                const [rows] = await conn.query("SELECT id FROM usuarios WHERE id = ? LIMIT 1", [userId]);
                if ((rows as Array<{ id: number }>).length === 0) {
                    await conn.rollback();
                    res.status(404).json({ error: "Usuario no encontrado" });
                    return;
                }

                const [updateResult] = await conn.query(
                    `UPDATE usuarios
                     SET estado = 'inactivo', permiso_factura = 'denegado', updated_at = NOW()
                     WHERE id = ?`,
                    [userId],
                );

                if ((updateResult as any).affectedRows === 0) {
                    await conn.rollback();
                    res.status(404).json({ error: "Usuario no encontrado" });
                    return;
                }

                await conn.commit();
                res.status(200).json({
                    message: "El usuario tiene facturas o movimientos relacionados, por eso fue desactivado en lugar de eliminarse.",
                    action: "deactivated",
                });
                return;
            } catch (fallbackError) {
                await conn.rollback();
                res.status(500).json({
                    error: "Error al desactivar usuario",
                    details: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
                });
                return;
            }
        }

        res.status(500).json({ error: "Error al eliminar usuario", details: error instanceof Error ? error.message : String(error) });
    } finally {
        conn.release();
    }
}
