import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

// Matches frontend AdminPanel.tsx which fetches all events and users from Firestore
export const getAllUsers = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, displayName: true,
        photoURL: true, role: true, createdAt: true,
        _count: { select: { events: true, participants: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    // Map to match frontend UserProfile shape (uid instead of id)
    res.json(users.map(u => ({
      uid: u.id,
      email: u.email,
      displayName: u.displayName,
      photoURL: u.photoURL,
      role: u.role,
      createdAt: u.createdAt.getTime(),
      eventsCount: u._count.events,
      participationsCount: u._count.participants,
    })));
  } catch (err) { next(err); }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User deleted" });
  } catch (err) { next(err); }
};

export const getAllEventsAdmin = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { participants: true } } },
    });
    res.json(events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date,
      time: e.time,
      venue: e.venue,
      organizerId: e.organizerId,
      organizerName: e.organizerName,
      isPublic: e.isPublic,
      isFree: e.isFree,
      registrationFee: e.registrationFee,
      category: e.category,
      imageUrl: e.imageUrl,
      status: e.status,
      isFeatured: e.isFeatured,
      avgRating: e.avgRating,
      reviewsCount: e.reviewsCount,
      createdAt: e.createdAt.getTime(),
      participantsCount: e._count.participants,
    })));
  } catch (err) { next(err); }
};
