import { Router } from "express";
import { createInventoryMov } from "../models/inventory _movement/CreateInventoryMov";
import { getInventoryMov } from "../models/inventory _movement/GetInventoryMov";
import { editInventoryMov } from "../models/inventory _movement/EditInventoryMov";
import { deleteInventoryMov } from "../models/inventory _movement/DeleteInventoryMov";

const router = Router();

router.get("/", getInventoryMov);
router.post("/create", createInventoryMov);
router.delete("/delete/:id", deleteInventoryMov);
router.put("/edit/:id", editInventoryMov);

export { router as InventoriMovRoutes };
