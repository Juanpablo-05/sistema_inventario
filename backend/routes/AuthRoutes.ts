import { Router } from "express";
import { login, me } from "../models/auth/AuthController";
import { verifyToken } from "../middleware/Auth";

const route = Router();

route.post("/login", login);
route.get("/me", verifyToken, me);

export { route as AuthRoutes };
