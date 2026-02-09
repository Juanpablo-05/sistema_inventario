import { Router } from "express";
import { createInventoryMov } from "../endpoints/inventory _movement/CreateInventoryMov";
import { getInventoryMov } from "../endpoints/inventory _movement/GetInventoryMov";
import { editInventoryMov } from "../endpoints/inventory _movement/EditInventoryMov";
import { deleteInventoryMov } from "../endpoints/inventory _movement/DeleteInventoryMov";

const router = Router();

router.get("/",getInventoryMov)
router.post("/create", createInventoryMov);
router.delete("/delete/:id", deleteInventoryMov);
router.put("/edit/:id", editInventoryMov);



export { router as InventoriMovRoutes };