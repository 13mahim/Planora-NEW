import { Router } from "express";
import { joinEvent, getParticipants, updateParticipantStatus } from "../controllers/participant.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

const router = Router();

// Must be before /:eventId to avoid conflict
router.get("/my/joined", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const participants = await prisma.participant.findMany({
      where: { userId: req.user!.uid, status: { in: ["approved", "pending"] } },
      include: { event: true },
      orderBy: { joinedAt: "desc" },
    });
    res.json(participants.map((p) => ({
      participantId: p.id,
      status: p.status,
      paymentStatus: p.paymentStatus,
      joinedAt: p.joinedAt.getTime(),
      event: {
        id: p.event.id, title: p.event.title, date: p.event.date,
        time: p.event.time, venue: p.event.venue, imageUrl: p.event.imageUrl,
        isFree: p.event.isFree, registrationFee: p.event.registrationFee,
        isPublic: p.event.isPublic, organizerName: p.event.organizerName,
      },
    })));
  } catch (err) { next(err); }
});

router.post("/:eventId/join", authenticate, joinEvent);
router.get("/:eventId", authenticate, getParticipants);
router.patch("/:id/status", authenticate, updateParticipantStatus);

export default router;
