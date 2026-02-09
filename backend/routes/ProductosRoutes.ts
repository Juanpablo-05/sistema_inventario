import { Router } from "express";
import { createProduct } from "../endpoints/products/CreateProducts";
import { getProducts } from "../endpoints/products/GetProducts";
import { editProduct } from "../endpoints/products/EditProducts";
import { deleteProduct } from "../endpoints/products/DeleteProducts";

const route = Router();

route.post("/create", createProduct);
route.get("/", getProducts);
route.put("/edit/:id", editProduct);
route.delete("/delete/:id", deleteProduct);

export { route as ProductsRoutes };
