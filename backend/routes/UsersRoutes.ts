import { Router } from "express";

import { getUsers } from "../controllers/users/GetUsers";
import { createUser } from "../controllers/users/CreateUsers";
import { deleteUser } from "../controllers/users/DeleteUsers";
import { editUsers } from "../controllers/users/EditUsers";
import { getUserId } from "../controllers/users/GetUserId";

const router = Router();

router.get("/", getUsers);
router.post("/create", createUser);
router.delete("/delete/:id", deleteUser);
router.put("/edit/:id", editUsers);
router.get("/get/:id", getUserId);

export { router as UsersRoutes };
