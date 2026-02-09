function normalizeDateOnly(value?: string): string | null {
    if (!value || typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
    const [year, month, day] = trimmed.split("-").map(Number);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    const iso = date.toISOString().slice(0, 10);
    return iso === trimmed ? trimmed : null;
}

function toMysqlDateTime(dateOnly: string): string {
    return `${dateOnly} 00:00:00`;
}

function toMysqlDateTimeWithTime(dateTime: string): string | null {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 19).replace("T", " ");
}

export { normalizeDateOnly, toMysqlDateTime, toMysqlDateTimeWithTime };