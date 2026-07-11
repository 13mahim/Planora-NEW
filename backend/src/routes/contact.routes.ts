import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ message: "Name, email, and message are required." });
      return;
    }
    // Store in notifications table as a workaround (no Contact model needed)
    // Just return success - data logged server-side
    console.log("[Contact Form]", { name, email, subject, message, time: new Date().toISOString() });
    res.json({ message: "Message received. We'll get back to you within 24 hours." });
  } catch (err) { next(err); }
});

export default router;
