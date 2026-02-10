import mysql from "mysql2";
import { opc } from "../.env";

export const db = mysql.createPool({
    host: opc.DB_HOST,
    user: opc.DB_USER,
    password: opc.DB_PASSWORD,
    database: opc.DB_NAME,
    port: Number(opc.DB_PORT ?? 3306),
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
