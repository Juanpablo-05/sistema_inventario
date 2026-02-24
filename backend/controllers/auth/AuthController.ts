import "dotenv/config";
import { Request, Response } from "express";
import { AuthRequest, signAccessToken } from "../../middleware/Auth";
import { db } from "../../db/db";
import { RowDataPacket } from "mysql2";

type UserRow = RowDataPacket & {
    id: number;
    username: string;
    password: number;
    role: "admin" | "user";
};

export async function login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body as {
        username?: string;
        password?: number;
    };

    if (!username || !password) {
        res.status(400).json({ error: "username y password son obligatorios" });
        return;
    }

    try {
        const [rows] = await db
            .promise()
            .query<UserRow[]>(
                "SELECT id, username, password, role FROM users WHERE username = ? LIMIT 1",
                [username],
            );

        if (!rows.length) {
            res.status(401).json({ error: "Credenciales invalidas" });
            return;
        }

        const user = rows[0];
        const isPasswordValid = password === user.password;

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
        res.status(500).json({ error: "Error al autenticar usuario" });
    }
}

export function me(req: Request, res: Response): void {
    const user = (req as AuthRequest).user;
    res.status(200).json({ user: user ?? null });
}
