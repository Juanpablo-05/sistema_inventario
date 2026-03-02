import { ApiError } from "../context/ApiContext";

type ApiErrorObjectData = {
    error?: string;
    details?: string;
    attemptsLeft?: number;
    [key: string]: unknown;
};

export type ParsedApiError = {
    status?: number;
    message: string;
    error?: string;
    details?: string;
    attemptsLeft?: number;
    rawData?: ApiErrorObjectData | string | null;
};

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function getApiErrorInfo(error: unknown): ParsedApiError {
    if (error instanceof ApiError) {
        if (isObject(error.data)) {
            const data = error.data as ApiErrorObjectData;
            return {
                status: error.status,
                message: error.message,
                error: typeof data.error === "string" ? data.error : undefined,
                details: typeof data.details === "string" ? data.details : undefined,
                attemptsLeft:
                    typeof data.attemptsLeft === "number" ? data.attemptsLeft : undefined,
                rawData: data,
            };
        }

        return {
            status: error.status,
            message: error.message,
            rawData: error.data,
        };
    }

    if (error instanceof Error) {
        return { message: error.message };
    }

    return { message: "Error inesperado" };
}
