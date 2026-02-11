import { editCategori } from "../models/categoris/EditCategori";
import { createCategori } from "../models/categoris/CreateCategori";
import { deleteCategori } from "../models/categoris/DeleteCategori";
import { getCategori } from "../models/categoris/Getcategori";

import { Router } from "express";

const route = Router();

route.post("/create", createCategori);
route.get("/get", getCategori);
route.put("/edit/:id", editCategori);
route.delete("/delete/:id", deleteCategori);

export { route as CategoriesRoutes };
