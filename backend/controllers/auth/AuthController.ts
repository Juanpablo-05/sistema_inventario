import "dotenv/config";
import { Request, Response } from "express";
import { AuthRequest, signAccessToken } from "../../middleware/Auth";
import { db } from "../../db/db";
import { RowDataPacket } from "mysql2";

type UserRow = RowDataPacket & {
    id: number;
    username: string;
    password_hash: number;
    numero_movimientos: number;
    role: "admin" | "empleado";

    created_at: string;
    updated_at: string;
};

export async function login(req: Request, res: Response): Promise<void> {
    const { username, password_hash } = req.body as {
        username?: string;
        password_hash?: number;
    };

    if (!username || !password_hash) {
        res.status(400).json({ error: "username y password son obligatorios" });
        return;
    }

    try {
        const [rows] = await db
            .promise()
            .query<UserRow[]>(
                "SELECT id, nombre, username, password_hash, role, numero_movimientos FROM users WHERE username = ? LIMIT 1",
                [username],
            );

        if (!rows.length) {
            res.status(401).json({ error: "Credenciales invalidas" });
            return;
        }

        const user = rows[0];
        const isPasswordValid = password === user.password_hash;

        if (!isPasswordValid) {
            res.status(401).json({ error: "contraseña invalida" });
            return;
        }

        const token = signAccessToken({
            id: Number(user.id),
            username: String(user.username),
            role: String(user.role),
        });

        res.status(200).json({
            token,
            tokenType: "Bearer",
            user: {
                id: Number(user.id),
                username: String(user.username),
                role: String(user.role),
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
