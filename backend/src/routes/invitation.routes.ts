import { Router } from "express";
import { sendInvitation, getMyInvitations, acceptInvitation, declineInvitation } from "../controllers/invitation.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateInvitation } from "../middlewares/validate.middleware";

const router = Router();

router.post("/", authenticate, validateInvitation, sendInvitation);
router.get("/my", authenticate, getMyInvitations);
router.patch("/:id/accept", authenticate, acceptInvitation);
router.patch("/:id/decline", authenticate, declineInvitation);

export default router;
