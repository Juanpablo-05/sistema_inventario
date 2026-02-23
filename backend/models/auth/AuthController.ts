import "dotenv/config";
import { Request, Response } from "express";
import { AuthRequest, signAccessToken } from "../../middleware/Auth";

const AUTH_USER = process.env.AUTH_USER || "admin";
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "admin123";
const AUTH_ROLE = process.env.AUTH_ROLE || "admin";

export function login(req: Request, res: Response): void {
    const { username, password } = req.body as {
        username?: string;
        password?: string;
    };

    if (!username || !password) {
        res.status(400).json({ error: "username y password son obligatorios" });
        return;
    }

    if (username !== AUTH_USER || password !== AUTH_PASSWORD) {
        res.status(401).json({ error: "Credenciales invalidas" });
        return;
    }

    const token = signAccessToken({
        id: 1,
        username: AUTH_USER,
        role: AUTH_ROLE,
    });

    res.status(200).json({
        token,
        tokenType: "Bearer",
    });
}

export function me(req: Request, res: Response): void {
    const user = (req as AuthRequest).user;
    res.status(200).json({ user: user ?? null });
}
