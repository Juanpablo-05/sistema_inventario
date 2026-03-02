import { Request, Response } from "express"
import { db } from "../../db/db"
import bcrypt from "bcrypt"

type userRowsRegister = {
    nombre: string;
    username: string;
    email: string;
    password_hash: string;
};

export async function register(req: Request, res: Response): Promise<void> { 

    const { nombre, username, email, password_hash }: userRowsRegister = req.body

    if (!nombre || nombre.trim() === "") {
        res.status(400).json({ error: "El nombre es requerido" })
        return
    }

    if (!username || username.trim() === "") {
        res.status(400).json({ error: "El nombre de usuario es requerido" })
        return
    }

    if (!email || email.trim() === "") {
        res.status(400).json({ error: "El email es requerido" })
        return
    }

    if (!password_hash || password_hash.trim() === "") {
        res.status(400).json({ error: "La contraseña es requerida" })
        return
    }

    try {
        const hashedPassword = await bcrypt.hash(password_hash, 10)
        const query = `
            INSERT INTO usuarios (nombre, username, email, password_hash) 
            VALUES (?, ?, ?, ?)
        `
        db.query(query, [nombre, username, email, hashedPassword], function(err) {
            if (err) {
                res.status(500).json({ error: "Error al registrar el usuario" })
                return
            }
            res.status(200).json({ message: "Usuario registrado exitosamente" })
        })
    } catch (error) {
        res.status(500).json({ error: "Error al encriptar la contraseña" })
    }

}