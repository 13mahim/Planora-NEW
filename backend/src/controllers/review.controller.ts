import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middlewares/errorHandler";
import { AuthRequest } from "../middlewares/auth.middleware";

// Response matches frontend Review interface:
// { id, eventId, eventTitle, userId, userName, rating, comment, createdAt (number) }
const formatReview = (r: any) => ({
  id: r.id,
  eventId: r.eventId,
  eventTitle: r.eventTitle,
  userId: r.userId,
  userName: r.userName,
  rating: r.rating,
  comment: r.comment,
  createdAt: r.createdAt.getTime(),
});

// Matches frontend eventService.addReview() — also recalculates avgRating on event
export const addReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { eventId, rating, comment } = req.body;
    if (!eventId || !rating || !comment) throw new AppError("eventId, rating, and comment required", 400);
    if (rating < 1 || rating > 5) throw new AppError("Rating must be between 1 and 5", 400);

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError("Event not found", 404);

    const user = await prisma.user.findUnique({ where: { id: req.user!.uid } });
    if (!user) throw new AppError("User not found", 404);

    const existing = await prisma.review.findUnique({
      where: { userId_eventId: { userId: user.id, eventId } },
    });
    if (existing) throw new AppError("You have already reviewed this event", 409);

    const review = await prisma.review.create({
      data: {
        eventId,
        eventTitle: event.title,
        userId: user.id,
        userName: user.displayName,
        rating,
        comment,
      },
    });

    // Recalculate avgRating — matches frontend eventService.addReview() logic
    const allReviews = await prisma.review.findMany({ where: { eventId } });
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
    await prisma.event.update({
      where: { id: eventId },
      data: {
        avgRating: parseFloat(avgRating.toFixed(1)),
        reviewsCount: allReviews.length,
      },
    });

    res.status(201).json(formatReview(review));
  } catch (err) { next(err); }
};

// Matches frontend eventService.getReviews(eventId)
export const getEventReviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { eventId: req.params.eventId },
      orderBy: { createdAt: "desc" },
    });
    res.json(reviews.map(formatReview));
  } catch (err) { next(err); }
};

// Matches frontend eventService.getUserReviews(userId) — used in MyReviews.tsx
export const getUserReviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user!.uid },
      orderBy: { createdAt: "desc" },
    });
    res.json(reviews.map(formatReview));
  } catch (err) { next(err); }
};

export const updateReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new AppError("Review not found", 404);
    if (review.userId !== req.user!.uid) throw new AppError("Forbidden", 403);

    const { rating, comment } = req.body;
    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data: { rating, comment },
    });

    // Recalculate avgRating
    const allReviews = await prisma.review.findMany({ where: { eventId: review.eventId } });
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
    await prisma.event.update({
      where: { id: review.eventId },
      data: { avgRating: parseFloat(avgRating.toFixed(1)) },
    });

    res.json(formatReview(updated));
  } catch (err) { next(err); }
};

export const deleteReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new AppError("Review not found", 404);
    if (review.userId !== req.user!.uid && req.user!.role !== "admin") throw new AppError("Forbidden", 403);

    await prisma.review.delete({ where: { id: req.params.id } });

    // Recalculate avgRating
    const allReviews = await prisma.review.findMany({ where: { eventId: review.eventId } });
    const avgRating = allReviews.length
      ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
      : null;
    await prisma.event.update({
      where: { id: review.eventId },
      data: {
        avgRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
        reviewsCount: allReviews.length,
      },
    });

    res.json({ message: "Review deleted" });
  } catch (err) { next(err); }
};
