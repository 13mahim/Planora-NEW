// Replaces Firebase Firestore calls with REST API calls
// All method signatures and return shapes are kept identical to the original
// so existing pages (EventDetails, MyReviews, etc.) work without changes.
import api from "./api";
import { Event, Participant, Review, Invitation } from "../types";

export const eventService = {
  // ── Events ──────────────────────────────────────────────────────────────

  async createEvent(eventData: Omit<Event, "id" | "createdAt" | "status">) {
    const { data } = await api.post<Event>("/events", eventData);
    return data.id;
  },

  async getPublicEvents(search?: string, filter?: string) {
    const { data } = await api.get<Event[]>("/events", { params: { search, filter } });
    return data;
  },

  async getUpcomingEvents() {
    const { data } = await api.get<Event[]>("/events/upcoming");
    return data;
  },

  async getFeaturedEvent() {
    const { data } = await api.get<Event | null>("/events/featured");
    return data;
  },

  async getEventById(id: string) {
    const { data } = await api.get<Event>(`/events/${id}`);
    return data;
  },

  async getMyEvents() {
    const { data } = await api.get<Event[]>("/events/my");
    return data;
  },

  async updateEvent(id: string, eventData: Partial<Event>) {
    const { data } = await api.put<Event>(`/events/${id}`, eventData);
    return data;
  },

  async deleteEvent(id: string) {
    await api.delete(`/events/${id}`);
  },

  // ── Participants ─────────────────────────────────────────────────────────

  // Matches original: joinEvent(eventId, userId, userName, userEmail, isPaid)
  // Backend derives userId from JWT token, so we just pass eventId
  async joinEvent(eventId: string, _userId: string, _userName: string, _userEmail: string, _isPaid: boolean) {
    const { data } = await api.post(`/participants/${eventId}/join`);
    return data;
  },

  async getParticipants(eventId: string) {
    const { data } = await api.get<Participant[]>(`/participants/${eventId}`);
    return data;
  },

  async updateParticipantStatus(participantId: string, status: "approved" | "rejected" | "banned") {
    const { data } = await api.patch(`/participants/${participantId}/status`, { status });
    return data;
  },

  async getJoinedEvents() {
    const { data } = await api.get("/participants/my/joined");
    return data as Array<{ participantId: string; status: string; paymentStatus: string; joinedAt: number; event: any }>;
  },

  // ── Reviews ──────────────────────────────────────────────────────────────

  // Matches original: addReview(reviewData) — returns review id
  async addReview(reviewData: Omit<Review, "id" | "createdAt">) {
    const { data } = await api.post<Review>("/reviews", reviewData);
    return data.id;
  },

  async getReviews(eventId: string) {
    const { data } = await api.get<Review[]>(`/reviews/event/${eventId}`);
    return data;
  },

  // Matches original: getUserReviews(userId) — used in MyReviews.tsx
  async getUserReviews(_userId: string) {
    // userId comes from JWT on backend, param ignored
    const { data } = await api.get<Review[]>("/reviews/my");
    return data;
  },

  async updateReview(id: string, rating: number, comment: string) {
    const { data } = await api.put<Review>(`/reviews/${id}`, { rating, comment });
    return data;
  },

  async deleteReview(id: string) {
    await api.delete(`/reviews/${id}`);
  },

  // ── Invitations ──────────────────────────────────────────────────────────

  async sendInvitation(eventId: string, inviteeEmail: string) {
    const { data } = await api.post<Invitation>("/invitations", { eventId, inviteeEmail });
    return data;
  },

  async getMyInvitations() {
    const { data } = await api.get<Invitation[]>("/invitations/my");
    return data;
  },

  async acceptInvitation(id: string) {
    const { data } = await api.patch(`/invitations/${id}/accept`);
    return data;
  },

  async declineInvitation(id: string) {
    const { data } = await api.patch(`/invitations/${id}/decline`);
    return data;
  },

  // ── Payment ──────────────────────────────────────────────────────────────

  async createCheckoutSession(eventId: string) {
    const { data } = await api.post<{ url: string; sessionId: string }>("/payment/checkout", { eventId });
    return data;
  },

  async verifyPayment(sessionId: string) {
    const { data } = await api.get("/payment/verify", { params: { sessionId } });
    return data;
  },
};
