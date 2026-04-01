import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middlewares/errorHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createNotification } from "./notification.controller";
import { sendEmail, emailTemplates } from "../lib/email";

// Response matches frontend Participant interface:
// { id, eventId, userId, userName, userEmail, status, paymentStatus, joinedAt (number) }
const formatParticipant = (p: any) => ({
  id: p.id,
  eventId: p.eventId,
  userId: p.userId,
  userName: p.userName,
  userEmail: p.userEmail,
  status: p.status,
  paymentStatus: p.paymentStatus,
  joinedAt: p.joinedAt.getTime(),
});

// Join logic matching frontend eventService.joinEvent():
// isPaid=false → status: "approved", paymentStatus: "unpaid"
// isPaid=true  → status: "pending",  paymentStatus: "paid" (after payment)
// Private event → status: "pending" regardless
export const joinEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.eventId } });
    if (!event) throw new AppError("Event not found", 404);

    const user = await prisma.user.findUnique({ where: { id: req.user!.uid } });
    if (!user) throw new AppError("User not found", 404);

    const existing = await prisma.participant.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: event.id } },
    });
    if (existing) throw new AppError("Already joined or requested", 409);

    // Determine status:
    // Public + Free → approved instantly
    // Public + Paid → pending (payment required)
    // Private (any) → pending (organizer approval required)
    const isPaid = !event.isFree;
    const isPrivate = !event.isPublic;
    const status = (!isPaid && !isPrivate) ? "approved" : "pending";
    const paymentStatus = isPaid ? "unpaid" : "unpaid"; // stays unpaid until payment confirmed

    const participant = await prisma.participant.create({
      data: {
        eventId: event.id,
        userId: user.id,
        userName: user.displayName,
        userEmail: user.email,
        status,
        paymentStatus,
      },
    });

    const message = status === "approved"
      ? "Joined successfully!"
      : isPaid
      ? "Proceed to payment to complete registration"
      : "Join request sent, awaiting organizer approval";

    res.status(201).json({ participant: formatParticipant(participant), message });
  } catch (err) { next(err); }
};

export const getParticipants = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const participants = await prisma.participant.findMany({
      where: { eventId: req.params.eventId },
    });
    res.json(participants.map(formatParticipant));
  } catch (err) { next(err); }
};

export const updateParticipantStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body; // "approved" | "rejected" | "banned"
    const participant = await prisma.participant.findUnique({
      where: { id: req.params.id },
      include: { event: true },
    });
    if (!participant) throw new AppError("Participant not found", 404);
    if (participant.event.organizerId !== req.user!.uid && req.user!.role !== "admin") {
      throw new AppError("Forbidden", 403);
    }

    const updated = await prisma.participant.update({
      where: { id: req.params.id },
      data: { status },
    });

    // Send notification + email based on status
    const user = await prisma.user.findUnique({ where: { id: participant.userId } });
    if (user) {
      if (status === "approved") {
        await createNotification(participant.userId, "Request Approved", `Your request to join "${participant.event.title}" was approved!`);
        const tmpl = emailTemplates.participantApproved(participant.event.title);
        await sendEmail(user.email, tmpl.subject, tmpl.html);
      } else if (status === "rejected") {
        await createNotification(participant.userId, "Request Declined", `Your request to join "${participant.event.title}" was declined.`);
        const tmpl = emailTemplates.participantRejected(participant.event.title);
        await sendEmail(user.email, tmpl.subject, tmpl.html);
      }
    }

    res.json(formatParticipant(updated));
  } catch (err) { next(err); }
};
