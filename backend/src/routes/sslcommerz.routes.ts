import { Router } from "express";
import { initSSLPayment, sslSuccess, sslIPN } from "../controllers/sslcommerz.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/init", authenticate, initSSLPayment);
router.post("/success", sslSuccess);
router.post("/ipn", sslIPN);

export default router;
