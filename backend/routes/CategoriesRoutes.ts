import { editCategori } from "../controllers/categoris/EditCategori";
import { createCategori } from "../controllers/categoris/CreateCategori";
import { deleteCategori } from "../controllers/categoris/DeleteCategori";
import { getCategori } from "../controllers/categoris/Getcategori";

import { Router } from "express";

const route = Router();

route.post("/create", createCategori);
route.get("/get", getCategori);
route.put("/edit/:id", editCategori);
route.delete("/delete/:id", deleteCategori);

export { route as CategoriesRoutes };
