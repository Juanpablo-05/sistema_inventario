import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";
import { db } from "../../db/db";
import {
    hashResetOtp,
    normalizeEmail,
    RESET_OTP_MAX_ATTEMPTS,
} from "./utils/OtpHelpers";

type UserEmailRow = RowDataPacket & {
    id: number;
    email: string;
};

type PasswordResetRow = RowDataPacket & {
    id: number;
    code_hash: string;
    expires_at: Date | string;
    attempts: number;
    used_at: Date | null;
};

function isExpired(value: Date | string): boolean {
    const parsed = new Date(value).getTime();
    if (Number.isNaN(parsed)) return true;
    return parsed < Date.now();
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
    const {
        email,
        otp,
        code,
        newPassword,
        password,
        password_hash,
    } = req.body as {
        email?: string;
        otp?: string;
        code?: string;
        newPassword?: string;
        password?: string;
        password_hash?: string;
    };

    const otpInput = (otp ?? code ?? "").trim();
    const newPasswordInput = (newPassword ?? password ?? password_hash ?? "").trim();

    if (!email || typeof email !== "string" || email.trim() === "") {
        res.status(400).json({ error: "El email es obligatorio" });
        return;
    }

    if (!otpInput || !/^\d{6}$/.test(otpInput)) {
        res.status(400).json({ error: "El OTP debe tener 6 digitos" });
        return;
    }

    if (newPasswordInput.length < 8) {
        res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres" });
        return;
    }

    const normalizedEmail = normalizeEmail(email);

    try {
        const [users] = await db
            .promise()
            .query<UserEmailRow[]>(
                "SELECT id, email FROM usuarios WHERE LOWER(email) = LOWER(?) LIMIT 1",
                [normalizedEmail],
            );

        const user = users[0];
        if (!user) {
            res.status(400).json({ error: "El OTP no es valido o expiro" });
            return; 
        }

        const [resets] = await db
            .promise()
            .query<PasswordResetRow[]>(
                "SELECT id, code_hash, expires_at, attempts, used_at FROM password_resets WHERE user_id = ? AND used_at IS NULL ORDER BY created_at DESC LIMIT 1",
                [user.id],
            );

        const activeReset = resets[0];
        if (!activeReset) {
            res.status(400).json({ error: "No hay un OTP pendiente para este usuario" });
            return;
        }

        if (activeReset.attempts >= RESET_OTP_MAX_ATTEMPTS) {
            await db.promise().query("UPDATE password_resets SET used_at = NOW() WHERE id = ?", [activeReset.id]);
            res.status(429).json({ error: "Se excedio el numero de intentos permitidos" });
            return;
        }

        if (isExpired(activeReset.expires_at)) {
            await db.promise().query("UPDATE password_resets SET used_at = NOW() WHERE id = ?", [activeReset.id]);
            res.status(400).json({ error: "El OTP expiro. Solicita uno nuevo" });
            return;
        }

        const otpHash = hashResetOtp(otpInput);
        if (otpHash !== activeReset.code_hash) {
            const nextAttempts = activeReset.attempts + 1;
            await db.promise().query("UPDATE password_resets SET attempts = ? WHERE id = ?", [
                nextAttempts,
                activeReset.id,
            ]);
            res.status(400).json({ error: "El OTP no es valido o expiro" });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPasswordInput, 10);

        const connection = await db.promise().getConnection();
        try {
            await connection.beginTransaction();

            await connection.query("UPDATE usuarios SET password_hash = ?, updated_at = NOW() WHERE id = ?", [
                hashedPassword,
                user.id,
            ]);

            await connection.query("UPDATE password_resets SET used_at = NOW() WHERE id = ?", [activeReset.id]);

            await connection.commit();
            res.status(200).json({ message: "Contraseña actualizada correctamente" });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({
            error: "No se pudo restablecer la contraseña",
            details: error instanceof Error ? error.message : String(error),
        });
    }
}
