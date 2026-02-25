import "dotenv/config";
import express from "express";
import cors from "cors";

import { logDbConnectionStatus } from "./db/db";

import { CategoriesRoutes } from "./routes/CategoriesRoutes";
import { ProductsRoutes } from "./routes/ProductosRoutes";
import { InventoriMovRoutes } from "./routes/InventoryMovRoutes";
import { AuthRoutes } from "./routes/AuthRoutes";
import { UsersRoutes } from "./routes/UsersRoutes";

import { verifyToken } from "./middleware/Auth";

const PORT = Number(process.env.PORT) || 3000;

const app = express();

app.use(cors());
app.use(express.json());

logDbConnectionStatus();

app.get("/", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/auth", AuthRoutes);
app.use("/users", verifyToken, UsersRoutes);
app.use("/categories", verifyToken, CategoriesRoutes);
app.use("/products", verifyToken, ProductsRoutes);
app.use("/inventory-movements", verifyToken, InventoriMovRoutes);

app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});
