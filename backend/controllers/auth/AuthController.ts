import "dotenv/config";
import { Request, Response } from "express";
import { AuthRequest, signAccessToken } from "../../middleware/Auth";
import { db } from "../../db/db";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";


type UserRow = RowDataPacket & {
    id: number;
    username: string | null;
    email: string | null;
    password_hash: string;
    rol: "admin" | "empleado";
};

export async function login(req: Request, res: Response): Promise<void> {
    const { identifier, username, email, password, password_hash } = req.body as {
        identifier?: string;
        username?: string;
        email?: string;
        password?: string;
        password_hash?: string;
    };

    const identifierInput = (identifier ?? username ?? email ?? "").trim();
    const passwordInput = password ?? password_hash;

    if (!identifierInput || !passwordInput) {
        res.status(400).json({ error: "identifier (username o email) y password son obligatorios" });
        return;
    }

    try {
        const [rows] = await db
            .promise()
            .query<UserRow[]>(
                "SELECT id, username, email, password_hash, rol FROM usuarios WHERE username = ? OR LOWER(email) = LOWER(?) LIMIT 1",
                [identifierInput, identifierInput],
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

        const principal = user.username ?? user.email ?? identifierInput;

        const token = signAccessToken({
            id: Number(user.id),
            username: String(principal),
            role: String(user.rol),
        });

        res.status(200).json({
            token,
            tokenType: "Bearer",
            user: {
                id: Number(user.id),
                username: String(principal),
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
