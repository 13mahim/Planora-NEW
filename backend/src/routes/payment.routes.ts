import { Router } from "express";
import { createCheckoutSession, verifyPayment, stripeWebhook } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/checkout", authenticate, createCheckoutSession);
router.get("/verify", authenticate, verifyPayment);
router.post("/webhook", stripeWebhook); // raw body — handled in index.ts

export default router;
