import { Router } from "express";
import { createProduct } from "../controllers/products/CreateProducts";
import { getProducts } from "../controllers/products/GetProducts";
import { editProduct } from "../controllers/products/EditProducts";
import { deleteProduct } from "../controllers/products/DeleteProducts";

const route = Router();

route.post("/create", createProduct);
route.get("/", getProducts);
route.put("/edit/:id", editProduct);
route.delete("/delete/:id", deleteProduct);

export { route as ProductsRoutes };
