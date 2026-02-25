import { Router } from "express";

import { getUsers } from "../controllers/users/GetUsers";
import { createUser } from "../controllers/users/CreateUsers";
import { deleteUser } from "../controllers/users/DeleteUsers";
import { editUsers } from "../controllers/users/EditUsers";

const router = Router();

router.get("/", getUsers);
router.post("/create", createUser);
router.delete("/delete/:id", deleteUser);
router.put("/edit/:id", editUsers);

export { router as UsersRoutes };
