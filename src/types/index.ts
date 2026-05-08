import { Timestamp } from "firebase/firestore";

// ── User ──────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ── Trip ──────────────────────────────────────────────────────────────────────

export type TripVisibility = "public" | "private" | "shared";

export interface Trip {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  visibility: TripVisibility;
  coverImageUrl?: string;
  destinations: string[]; // array of destination IDs
  startDate?: Timestamp;
  endDate?: Timestamp;
  budget?: number;
  currency?: string;
  tags?: string[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface ItineraryItem {
  id: string;
  tripId: string;
  day: number;
  order: number;
  title: string;
  description?: string;
  location?: GeoPoint;
  locationName?: string;
  category: ItineraryCategory;
  duration?: number; // minutes
  cost?: number;
  bookingUrl?: string;
  notes?: string;
  createdAt: Timestamp;
}

export type ItineraryCategory =
  | "transport"
  | "accommodation"
  | "food"
  | "activity"
  | "sightseeing"
  | "shopping"
  | "other";

// ── Destination ───────────────────────────────────────────────────────────────

export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: string;
  description?: string;
  imageUrl?: string;
  location: GeoPoint;
  tags?: string[];
  averageRating?: number;
  reviewCount?: number;
}

// ── Review ────────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  destinationId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  imageUrls?: string[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ── Geo ───────────────────────────────────────────────────────────────────────

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// ── Health check ──────────────────────────────────────────────────────────────

export interface HealthStatus {
  status: "ok" | "degraded" | "down";
  timestamp: string;
  version: string;
  services: {
    firestore: "ok" | "error";
    auth: "ok" | "error";
    storage: "ok" | "error";
  };
}
