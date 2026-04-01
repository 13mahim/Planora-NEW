import { Router } from "express";
import { register, login, refreshToken, getMe, updateProfile, changePassword } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateRegister, validateLogin } from "../middlewares/validate.middleware";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/refresh", refreshToken);
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateProfile);
router.put("/me/password", authenticate, changePassword);

export default router;
