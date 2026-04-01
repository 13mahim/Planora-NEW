import { Router } from "express";
import {
  createEvent, updateEvent, deleteEvent,
  getPublicEvents, getAllEvents, getUpcomingEvents,
  getFeaturedEvent, getEventById, getMyEvents, setFeaturedEvent,
} from "../controllers/event.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getPublicEvents);                          // public events list (Events.tsx)
router.get("/all", authenticate, requireAdmin, getAllEvents); // admin: all events
router.get("/upcoming", getUpcomingEvents);                // Home.tsx upcoming slider
router.get("/featured", getFeaturedEvent);                 // Home.tsx hero section
router.get("/my", authenticate, getMyEvents);              // MyEvents.tsx
router.get("/:id", getEventById);                          // EventDetails.tsx
router.post("/", authenticate, createEvent);
router.put("/:id", authenticate, updateEvent);
router.delete("/:id", authenticate, deleteEvent);
router.patch("/:id/feature", authenticate, requireAdmin, setFeaturedEvent);

export default router;
