import crypto from "crypto";

const rawTtlMinutes = Number(process.env.RESET_OTP_EXPIRES_MINUTES ?? 15);
const rawMaxAttempts = Number(process.env.RESET_OTP_MAX_ATTEMPTS ?? 5);

export const RESET_OTP_TTL_MINUTES = Number.isFinite(rawTtlMinutes) && rawTtlMinutes > 0
    ? rawTtlMinutes
    : 15;

export const RESET_OTP_MAX_ATTEMPTS = Number.isFinite(rawMaxAttempts) && rawMaxAttempts > 0
    ? rawMaxAttempts
    : 5;

const RESET_OTP_PEPPER = process.env.RESET_OTP_PEPPER ?? "";

export function normalizeEmail(email: string): string {
    return email.trim();
}

export function generateResetOtpCode(): string {
    return crypto.randomInt(100000, 1000000).toString();
}

export function hashResetOtp(code: string): string {
    return crypto
        .createHash("sha256")
        .update(`${code}:${RESET_OTP_PEPPER}`)
        .digest("hex");
}
