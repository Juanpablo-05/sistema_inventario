import { db } from "../../db/db";
import { userRowsEdit } from "./types/typeUsers";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

export async function editUsers(req: Request, res: Response): Promise<void> { 
    const userId = req.params.id;

    const { nombre, username, email, password_hash, role, estado, permiso_factura }: userRowsEdit = req.body;

    if (!userId || isNaN(Number(userId))) {
        res.status(400).json({ error: "ID de usuario inválido" });
        return;
    }

    if (nombre && nombre.trim() === "") {
        res.status(400).json({ error: "El nombre no puede estar vacío" });
        return;
    }

    if (username && username.trim() === "") {
        res.status(400).json({ error: "El nombre de usuario no puede estar vacío" });
        return;
    }

    if (email !== undefined && (typeof email !== "string" || email.trim() === "")) {
        res.status(400).json({ error: "El email no puede estar vacío" });
        return;
    }

    if (password_hash !== undefined && (typeof password_hash !== "string" || password_hash.trim() === "")) {
        res.status(400).json({ error: "La contraseña no puede estar vacía" });
        return;
    }

    if (role !== undefined && role !== "admin" && role !== "empleado") {
        res.status(400).json({ error: "El rol debe ser 'admin' o 'empleado'" });
        return;
    }
    if (estado !== undefined && estado !== "activo" && estado !== "inactivo") {
        res.status(400).json({ error: "El estado debe ser 'activo' o 'inactivo'" });
        return;
    }
    if (permiso_factura !== undefined && permiso_factura !== "permitido" && permiso_factura !== "denegado") {
        res.status(400).json({ error: "permiso_factura debe ser 'permitido' o 'denegado'" });
        return;
    }

    const fields: string[] = [];
    const params: Array<string | number> = [];

    if (nombre !== undefined) {
        fields.push("nombre = ?");
        params.push(nombre.trim());
    }

    if (username !== undefined) {
        fields.push("username = ?");
        params.push(username.trim());
    }

    if (email !== undefined) {
        fields.push("email = ?");
        params.push(email.trim());
    }
    

    if (password_hash !== undefined) {
        const hashedPassword = await bcrypt.hash(password_hash, 10);
        fields.push("password_hash = ?");
        params.push(hashedPassword);
    }

    if (role !== undefined) {
        fields.push("rol = ?");
        params.push(role);
    }
    if (estado !== undefined) {
        fields.push("estado = ?");
        params.push(estado);
    }
    if (permiso_factura !== undefined) {
        fields.push("permiso_factura = ?");
        params.push(permiso_factura);
    }

    if (!fields.length) {
        res.status(400).json({ error: "No hay campos para actualizar" });
        return;
    }

    try {
        params.push(Number(userId));
        const [result] = await db.promise().query(
            `UPDATE usuarios SET ${fields.join(", ")} WHERE id = ?`,
            params,
        );
        const updateResult = result as { affectedRows: number };

        if (updateResult.affectedRows === 0) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }

        res.status(200).json({ message: "Usuario actualizado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar usuario", details: error instanceof Error ? error.message : String(error) });
    }
}
