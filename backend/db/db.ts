import mysql from "mysql2/promise";

const {
    DB_HOST = "localhost",
    DB_PORT = "3306",
    DB_USER = "root",
    DB_PASSWORD = "",
    DB_NAME = "inventario",
} = process.env;

export const pool = mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export async function pingDb(): Promise<boolean> {
    const [rows] = await pool.query("SELECT 1 AS ok");
    return Array.isArray(rows) && rows.length > 0;
}
