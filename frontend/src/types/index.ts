export type UserRole = "admin" | "user";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  organizerId: string;
  organizerName: string;
  isPublic: boolean;
  isFree: boolean;
  registrationFee: number;
  category: string;
  imageUrl?: string;
  createdAt: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  avgRating?: number;
  reviewsCount?: number;
}

export interface Participant {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: "pending" | "approved" | "rejected" | "banned";
  paymentStatus: "unpaid" | "paid";
  joinedAt: number;
}

export interface Invitation {
  id: string;
  eventId: string;
  eventTitle: string;
  hostId: string;
  hostName: string;
  inviteeEmail: string;
  status: "pending" | "accepted" | "declined";
  createdAt: number;
}

export interface Review {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
}
