import { Router } from "express";
import { getMyNotifications, markAsRead, markOneAsRead } from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, getMyNotifications);
router.patch("/read-all", authenticate, markAsRead);
router.patch("/:id/read", authenticate, markOneAsRead);

export default router;
