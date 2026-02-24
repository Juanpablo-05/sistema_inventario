import { Router } from "express";
import { createInventoryMov } from "../controllers/inventory _movement/CreateInventoryMov";
import { getInventoryMov } from "../controllers/inventory _movement/GetInventoryMov";
import { editInventoryMov } from "../controllers/inventory _movement/EditInventoryMov";
import { deleteInventoryMov } from "../controllers/inventory _movement/DeleteInventoryMov";

const router = Router();

router.get("/", getInventoryMov);
router.post("/create", createInventoryMov);
router.delete("/delete/:id", deleteInventoryMov);
router.put("/edit/:id", editInventoryMov);

export { router as InventoriMovRoutes };
