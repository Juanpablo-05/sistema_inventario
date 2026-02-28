import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) || "3h";

export type AuthUserPayload = {
    id: number;
    username: string;
    role: string;
};

export type AuthRequest = Request & {
    user?: AuthUserPayload;
};

export function signAccessToken(payload: AuthUserPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Token no proporcionado" });
        return;
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
        res.status(401).json({ error: "Token invalido" });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & AuthUserPayload;
        (req as AuthRequest).user = {
            id: Number(decoded.id),
            username: String(decoded.username),
            role: String(decoded.role),
        };
        next();
    } catch (error) {
        res.status(401).json({ error: "Token invalido o expirado" });
    }
}
