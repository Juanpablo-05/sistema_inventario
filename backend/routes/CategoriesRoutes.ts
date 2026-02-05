import { editCategori } from "../endpoints/categoris/EditCategori";
import { createCategori } from "../endpoints/categoris/CreateCategori";
import { deleteCategori } from "../endpoints/categoris/DeleteCategori";
import { getCategori } from "../endpoints/categoris/Getcategori";

import { Router } from "express";

const route = Router();

route.post("/create", createCategori);
route.get("/get", getCategori);
route.put("/edit/:id", editCategori);
route.delete("/delete/:id", deleteCategori);

export { route as CategoriesRoutes };
