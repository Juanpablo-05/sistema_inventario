import "dotenv/config";
import { Request, Response } from "express";
import { AuthRequest, signAccessToken } from "../../middleware/Auth";
import { db } from "../../db/db";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";


type UserRow = RowDataPacket & {
    id: number;
    username: string;
    password_hash: string;
    rol: "admin" | "empleado";
};

export async function login(req: Request, res: Response): Promise<void> {
    const { username, password, password_hash } = req.body as {
        username?: string;
        password?: string;
        password_hash?: string;
    };
    const passwordInput = password ?? password_hash;

    if (!username || !passwordInput) {
        res.status(400).json({ error: "username y password son obligatorios" });
        return;
    }

    try {
        const [rows] = await db
            .promise()
            .query<UserRow[]>(
                "SELECT id, username, password_hash, rol FROM usuarios WHERE username = ? LIMIT 1",
                [username],
            );

        const user = rows[0];
        
        if (!user) {
            res.status(401).json({ error: "Las credenciales digitadas no coinciden con ninguna cuenta registrada" });
            return;
        }
        const isPasswordValid = await bcrypt.compare(passwordInput, user.password_hash);

        if (!isPasswordValid) {
            res.status(401).json({ error: "La contraseña ingresada no coincide con la registrada" });
            return;
        }

        if (user.username !== username) {
            res.status(401).json({ error: "El nombre de usuario no coincide con ninguna cuenta registrada" });
            return;
        }

        const token = signAccessToken({
            id: Number(user.id),
            username: String(user.username),
            role: String(user.rol),
        });

        res.status(200).json({
            token,
            tokenType: "Bearer",
            user: {
                id: Number(user.id),
                username: String(user.username),
                role: String(user.rol),
            },
        });
    } catch (error) {
        res.status(500).json({ error: "Error al autenticar usuario" , details: error instanceof Error ? error.message : String(error) });
    }
}

export function me(req: Request, res: Response): void {
    const user = (req as AuthRequest).user;
    res.status(200).json({ user: user ?? null });
}
