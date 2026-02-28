import { db } from "../../db/db";
import { Request, Response } from "express";
import { userRows } from "./types/typeUsers";
import bcrypt from "bcrypt"

export async function createUser(req: Request, res: Response): Promise<void> {
    const { nombre, username, email, password_hash, role, }: userRows = req.body;

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


    try {
        const hashedPassword = await bcrypt.hash(password_hash, 10);
        await db.promise().query(
            "INSERT INTO usuarios (nombre ,username, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)",
            [nombre, username, email, hashedPassword, role]
        );
        res.status(201).json({ message: "Usuario creado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al crear usuario", details: error instanceof Error ? error.message : String(error) });
    }
    
} 