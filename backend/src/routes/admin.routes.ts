import { Router } from "express";
import { getAllUsers, deleteUser, getAllEventsAdmin } from "../controllers/admin.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/events", getAllEventsAdmin);

export default router;
