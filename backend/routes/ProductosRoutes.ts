import { Router } from "express";
import { createProduct } from "../models/products/CreateProducts";
import { getProducts } from "../models/products/GetProducts";
import { editProduct } from "../models/products/EditProducts";
import { deleteProduct } from "../models/products/DeleteProducts";

const route = Router();

route.post("/create", createProduct);
route.get("/", getProducts);
route.put("/edit/:id", editProduct);
route.delete("/delete/:id", deleteProduct);

export { route as ProductsRoutes };
