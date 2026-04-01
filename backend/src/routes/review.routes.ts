import { Router } from "express";
import { addReview, getEventReviews, getUserReviews, updateReview, deleteReview } from "../controllers/review.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateReview } from "../middlewares/validate.middleware";

const router = Router();

router.post("/", authenticate, validateReview, addReview);
router.get("/event/:eventId", getEventReviews);
router.get("/my", authenticate, getUserReviews);
router.put("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);

export default router;
