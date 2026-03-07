import { db } from "../../db/db";
import { Request, Response } from "express";
import { userRows } from "./types/typeUsers";
import bcrypt from "bcrypt"

export async function createUser(req: Request, res: Response): Promise<void> {
    const {
        nombre,
        username,
        email,
        password_hash,
        role,
        estado,
        permiso_factura,
    }: userRows = req.body;

    if (!username || typeof username !== "string") {
        res.status(400).json({ error: "username es requerido y debe ser una cadena de texto" });
        return;
    }
    if (!email || typeof email !== "string") {
        res.status(400).json({ error: "email es requerido y debe ser una cadena de texto" });
        return;
    }
    if (!password_hash || typeof password_hash !== "string") {
        res.status(400).json({ error: "password_hash es requerido y debe ser una cadena de texto" });
        return;
    }
    if (!role || (role !== "admin" && role !== "empleado")) {
        console.log(role, "role");
        res.status(400).json({ error: "El rol es requerido y debe ser 'admin' o 'empleado'" });
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


    try {
        const hashedPassword = await bcrypt.hash(password_hash, 10);
        const estadoFinal = estado ?? "activo";
        const permisoFacturaFinal = permiso_factura ?? "denegado";
        await db.promise().query(
            "INSERT INTO usuarios (nombre, username, email, password_hash, rol, estado, permiso_factura) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [nombre, username, email, hashedPassword, role, estadoFinal, permisoFacturaFinal],
        );
        res.status(201).json({ message: "Usuario creado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al crear usuario", details: error instanceof Error ? error.message : String(error) });
    }
    
} 
