import { Router } from "express";
import { login, me } from "../controllers/auth/AuthController";
import { register } from "../controllers/auth/RegisterController";
import { sendResetPasswordOtp } from "../controllers/auth/OTPcodeController";
import { resetPassword } from "../controllers/auth/ResetPasswordController";
import { verifyToken } from "../middleware/Auth";

const route = Router();

route.post("/login", login);
route.post("/register", register);
route.post("/otp", sendResetPasswordOtp);
route.post("/reset-password", resetPassword);
route.get("/me", verifyToken, me);

export { route as AuthRoutes };
