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

    // Find admin user to send notification to
    const admin = await prisma.user.findFirst({ where: { role: "admin" } });
    if (admin) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: `Contact Form: ${subject || "New Message"} — from ${name}`,
          message: `${email}: ${message.substring(0, 200)}`,
        },
      });
    }

    res.json({ message: "Message received. We'll get back to you within 24 hours." });
  } catch (err) { next(err); }
});

export default router;
