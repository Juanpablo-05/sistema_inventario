import "dotenv/config";
import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import { Resend } from "resend";
import { db } from "../../db/db";
import {
    generateResetOtpCode,
    hashResetOtp,
    normalizeEmail,
    RESET_OTP_TTL_MINUTES,
} from "./utils/OtpHelpers";

type UserEmailRow = RowDataPacket & {
    id: number;
    email: string;
    username: string | null;
    nombre: string | null;
};

type ResendSendResponse = {
    data: { id: string } | null;
    error: {
        statusCode?: number;
        name?: string;
        message?: string;
    } | null;
};

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_FROM = process.env.RESEND_FROM ?? "Acme <onboarding@resend.dev>";

function getResendClient(): Resend | null {
    if (!RESEND_API_KEY) return null;
    return new Resend(RESEND_API_KEY);
}

function buildOtpEmailHtml(displayName: string, code: string): string {
    return `
        <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.4;">
            <h2>Recuperacion de contraseña</h2>
            <p>Hola ${displayName},</p>
            <p>Tu codigo OTP es:</p>
            <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</p>
            <p>Este codigo expira en ${RESET_OTP_TTL_MINUTES} minutos.</p>
            <p>Si no solicitaste este cambio, ignora este mensaje.</p>
        </div>
    `;
}

export async function sendResetPasswordOtp(req: Request, res: Response): Promise<void> {
    const { email } = req.body as { email?: string };
    if (!email || typeof email !== "string" || email.trim() === "") {
        res.status(400).json({ error: "El email es obligatorio" });
        return;
    }

    const normalizedEmail = normalizeEmail(email);

    try {
        const [users] = await db
            .promise()
            .query<UserEmailRow[]>(
                "SELECT id, email, username, nombre FROM usuarios WHERE LOWER(email) = LOWER(?) LIMIT 1",
                [normalizedEmail],
            );

        const user = users[0];

        const genericResponse = {
            message: "Si existe una cuenta con ese correo, enviaremos un codigo OTP.",
        };

        if (!user) {
            res.status(200).json(genericResponse);
            return;
        }

        if (!user.email) {
            res.status(400).json({ error: "El usuario no tiene un email asociado" });
            return;
        }

        const resendClient = getResendClient();
        if (!resendClient) {
            res.status(500).json({ error: "RESEND_API_KEY no configurada" });
            return;
        }

        const code = generateResetOtpCode();
        const codeHash = hashResetOtp(code);
        const expiresAt = new Date(Date.now() + RESET_OTP_TTL_MINUTES * 60 * 1000);

        await db
            .promise()
            .query("UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL", [user.id]);

        await db.promise().query(
            "INSERT INTO password_resets (user_id, code_hash, expires_at, attempts) VALUES (?, ?, ?, 0)",
            [user.id, codeHash, expiresAt],
        );

        const displayName = user.nombre ?? user.username ?? normalizedEmail;
        const sendResult = (await resendClient.emails.send({
            from: RESEND_FROM,
            to: [normalizeEmail(user.email)],
            subject: "Codigo OTP para restablecer tu contraseña",
            html: buildOtpEmailHtml(displayName, code),
        })) as ResendSendResponse;

        if (sendResult.error) {
            const resendMessage = sendResult.error.message ?? "Error al enviar el correo OTP";
            const isTestingRestriction = resendMessage.includes("You can only send testing emails");

            res.status(502).json({
                error: "No se pudo enviar el OTP por correo",
                details: isTestingRestriction
                    ? "Tu cuenta Resend está en modo testing. Verifica un dominio y usa un remitente de ese dominio."
                    : resendMessage,
            });
            return;
        }

        res.status(200).json(genericResponse);
    } catch (error) {
        res.status(500).json({
            error: "No se pudo generar el OTP",
            details: error instanceof Error ? error.message : String(error),
        });
    }
}
