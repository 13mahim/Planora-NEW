import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middlewares/errorHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createNotification } from "./notification.controller";
import { sendEmail, emailTemplates } from "../lib/email";

// Response matches frontend Invitation interface:
// { id, eventId, eventTitle, hostId, hostName, inviteeEmail, status, createdAt (number) }
const formatInvitation = (inv: any) => ({
  id: inv.id,
  eventId: inv.eventId,
  eventTitle: inv.eventTitle,
  hostId: inv.hostId,
  hostName: inv.hostName,
  inviteeEmail: inv.inviteeEmail,
  status: inv.status,
  createdAt: inv.createdAt.getTime(),
  // extra fields for dashboard UI
  fee: inv.event?.registrationFee,
  date: inv.event?.date,
});

export const sendInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { eventId, inviteeEmail } = req.body;
    if (!eventId || !inviteeEmail) throw new AppError("eventId and inviteeEmail required", 400);

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError("Event not found", 404);
    if (event.organizerId !== req.user!.uid) throw new AppError("Only organizer can send invitations", 403);

    const invitee = await prisma.user.findUnique({ where: { email: inviteeEmail } });
    if (!invitee) throw new AppError("User with this email not found", 404);

    const host = await prisma.user.findUnique({ where: { id: req.user!.uid } });
    if (!host) throw new AppError("Host not found", 404);

    const existing = await prisma.invitation.findUnique({
      where: { hostId_inviteeId_eventId: { hostId: host.id, inviteeId: invitee.id, eventId } },
    });
    if (existing) throw new AppError("Invitation already sent", 409);

    const invitation = await prisma.invitation.create({
      data: {
        eventId,
        eventTitle: event.title,
        hostId: host.id,
        hostName: host.displayName,
        inviteeId: invitee.id,
        inviteeEmail: invitee.email,
      },
    });

    // Send notification + email to invitee
    await createNotification(invitee.id, "New Invitation", `${host.displayName} invited you to "${event.title}"`);
    const tmpl = emailTemplates.invitationReceived(event.title, host.displayName);
    await sendEmail(invitee.email, tmpl.subject, tmpl.html);

    res.status(201).json(formatInvitation(invitation));
  } catch (err) { next(err); }
};

// GET /api/invitations/my — matches frontend Invitations.tsx which shows pending invites
export const getMyInvitations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invitations = await prisma.invitation.findMany({
      where: { inviteeId: req.user!.uid, status: "pending" },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(invitations.map(formatInvitation));
  } catch (err) { next(err); }
};

export const acceptInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id: req.params.id },
      include: { event: true },
    });
    if (!invitation) throw new AppError("Invitation not found", 404);
    if (invitation.inviteeId !== req.user!.uid) throw new AppError("Forbidden", 403);

    await prisma.invitation.update({ where: { id: invitation.id }, data: { status: "accepted" } });

    // Auto-join: free events get approved, paid stay pending until payment
    const user = await prisma.user.findUnique({ where: { id: req.user!.uid } });
    const status = invitation.event.isFree ? "approved" : "pending";

    const participant = await prisma.participant.upsert({
      where: { userId_eventId: { userId: req.user!.uid, eventId: invitation.eventId } },
      update: { status },
      create: {
        eventId: invitation.eventId,
        userId: req.user!.uid,
        userName: user!.displayName,
        userEmail: user!.email,
        status,
        paymentStatus: "unpaid",
      },
    });

    res.json({
      message: invitation.event.isFree ? "Invitation accepted!" : "Invitation accepted. Proceed to payment.",
      requiresPayment: !invitation.event.isFree,
      eventId: invitation.eventId,
    });
  } catch (err) { next(err); }
};

export const declineInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invitation = await prisma.invitation.findUnique({ where: { id: req.params.id } });
    if (!invitation) throw new AppError("Invitation not found", 404);
    if (invitation.inviteeId !== req.user!.uid) throw new AppError("Forbidden", 403);

    await prisma.invitation.update({ where: { id: invitation.id }, data: { status: "declined" } });
    res.json({ message: "Invitation declined" });
  } catch (err) { next(err); }
};
