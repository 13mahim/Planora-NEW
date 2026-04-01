import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middlewares/errorHandler";
import { AuthRequest } from "../middlewares/auth.middleware";

// Response shape matches frontend Event interface exactly:
// { id, title, description, date, time, venue, organizerId, organizerName,
//   isPublic, isFree, registrationFee, category, imageUrl?, createdAt (number),
//   status, avgRating?, reviewsCount? }
const formatEvent = (e: any) => ({
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
});

export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, date, time, venue, isPublic, isFree, registrationFee, category, imageUrl } = req.body;
    if (!title || !description || !date || !time || !venue) throw new AppError("Required fields missing", 400);
    if (!isFree && (!registrationFee || registrationFee <= 0)) throw new AppError("Registration fee required for paid events", 400);

    const user = await prisma.user.findUnique({ where: { id: req.user!.uid } });
    if (!user) throw new AppError("User not found", 404);

    const event = await prisma.event.create({
      data: {
        title, description, date, time, venue,
        isPublic: isPublic ?? true,
        isFree: isFree ?? true,
        registrationFee: isFree ? 0 : (registrationFee || 0),
        category: category || "General",
        imageUrl,
        organizerId: user.id,
        organizerName: user.displayName,
        status: "upcoming",
      },
    });
    res.status(201).json(formatEvent(event));
  } catch (err) { next(err); }
};

export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) throw new AppError("Event not found", 404);
    if (event.organizerId !== req.user!.uid && req.user!.role !== "admin") throw new AppError("Forbidden", 403);

    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(formatEvent(updated));
  } catch (err) { next(err); }
};

export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) throw new AppError("Event not found", 404);
    if (event.organizerId !== req.user!.uid && req.user!.role !== "admin") throw new AppError("Forbidden", 403);

    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ message: "Event deleted" });
  } catch (err) { next(err); }
};

// GET /api/events?isPublic=true&search=...&filter=public-free
export const getPublicEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, filter } = req.query;

    const where: any = { isPublic: true };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { organizerName: { contains: search as string, mode: "insensitive" } },
      ];
    }

    // filter matches frontend filter ids: "public-free" | "public-paid" | "private-free" | "private-paid"
    if (filter === "public-free") { where.isPublic = true; where.isFree = true; }
    else if (filter === "public-paid") { where.isPublic = true; where.isFree = false; }
    else if (filter === "private-free") { where.isPublic = false; where.isFree = true; }
    else if (filter === "private-paid") { where.isPublic = false; where.isFree = false; }

    const events = await prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(events.map(formatEvent));
  } catch (err) { next(err); }
};

export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, filter } = req.query;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { organizerName: { contains: search as string, mode: "insensitive" } },
      ];
    }
    if (filter === "public-free") { where.isPublic = true; where.isFree = true; }
    else if (filter === "public-paid") { where.isPublic = true; where.isFree = false; }
    else if (filter === "private-free") { where.isPublic = false; where.isFree = true; }
    else if (filter === "private-paid") { where.isPublic = false; where.isFree = false; }

    const events = await prisma.event.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json(events.map(formatEvent));
  } catch (err) { next(err); }
};

export const getUpcomingEvents = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await prisma.event.findMany({
      where: { isPublic: true, status: "upcoming" },
      take: 9,
      orderBy: { createdAt: "desc" },
    });
    res.json(events.map(formatEvent));
  } catch (err) { next(err); }
};

export const getFeaturedEvent = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.event.findFirst({
      where: { isFeatured: true, status: "upcoming" },
    });
    res.json(event ? formatEvent(event) : null);
  } catch (err) { next(err); }
};

export const getEventById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) throw new AppError("Event not found", 404);

    // Private events: only organizer or approved participants can view
    if (!event.isPublic) {
      if (!req.user) throw new AppError("Login required to view private events", 401);
      if (event.organizerId !== req.user.uid && req.user.role !== "admin") {
        const participant = await prisma.participant.findUnique({
          where: { userId_eventId: { userId: req.user.uid, eventId: event.id } },
        });
        if (!participant || participant.status !== "approved") {
          throw new AppError("This is a private event", 403);
        }
      }
    }
    res.json(formatEvent(event));
  } catch (err) { next(err); }
};

export const getMyEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const events = await prisma.event.findMany({
      where: { organizerId: req.user!.uid },
      orderBy: { createdAt: "desc" },
    });
    res.json(events.map(formatEvent));
  } catch (err) { next(err); }
};

export const setFeaturedEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.event.updateMany({ where: { isFeatured: true }, data: { isFeatured: false } });
    const event = await prisma.event.update({ where: { id: req.params.id }, data: { isFeatured: true } });
    res.json(formatEvent(event));
  } catch (err) { next(err); }
};
