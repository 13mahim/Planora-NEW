import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const [totalEvents, totalUsers, totalReviews] = await Promise.all([
      prisma.event.count(),
      prisma.user.count(),
      prisma.review.count(),
    ]);
    res.json({ totalEvents, totalUsers, totalReviews });
  } catch (err) { next(err); }
});

export default router;
