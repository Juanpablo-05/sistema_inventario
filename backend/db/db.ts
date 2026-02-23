import "dotenv/config";
import mysql from "mysql2";

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "prueba";

export const db = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
});

export function logDbConnectionStatus(): void {
    db.getConnection((err, connection) => {
        if (err) {
        console.error("Error connecting to the database:", err.message);
        return;
        }
        connection.release();
        console.log("Connected to the MySQL database.");
    });
}
