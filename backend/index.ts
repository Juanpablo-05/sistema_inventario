import express from "express";
import cors from "cors";
import { logDbConnectionStatus } from "./db/db";
import { CategoriesRoutes } from "./routes/CategoriesRoutes";
import { ProductsRoutes } from "./routes/ProductosRoutes";
import { InventoriMovRoutes } from "./routes/InventoryMovRoutes";

const PORT = Number(process.env.PORT) || 3000;

const app = express();

app.use(cors());
app.use(express.json());

logDbConnectionStatus();

app.get("/", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/categories", CategoriesRoutes);
app.use("/products", ProductsRoutes);
app.use("/inventory-movements", InventoriMovRoutes);

app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});
