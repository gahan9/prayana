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

// ── AI Chat ──────────────────────────────────────────────────────────────────

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: {
    suggestedItinerary?: Partial<ItineraryItem>[];
    suggestedBudget?: BudgetBreakdown;
  };
  createdAt: Timestamp;
}

// ── Wizard ───────────────────────────────────────────────────────────────────

export type InterestCategory =
  | "food"
  | "culture"
  | "thrill"
  | "shopping"
  | "souvenirs"
  | "memory"
  | "nature"
  | "nightlife";

export type TransportMode = "flight" | "train" | "bus" | "car" | "walk";

export interface WizardInput {
  destinations: string[];
  dateRange: { start: string; end: string };
  budget: {
    amount: number;
    currency: string;
    flexibility: "strict" | "moderate" | "flexible";
  };
  travelers: number;
  interests: InterestCategory[];
  transportPreference: TransportMode[];
}

// ── Budget ───────────────────────────────────────────────────────────────────

export type BudgetCategory =
  | "accommodation"
  | "food"
  | "transport"
  | "activities"
  | "shopping"
  | "contingency";

export interface BudgetBreakdown {
  totalBudget: number;
  currency: string;
  categories: Record<BudgetCategory, { planned: number; actual: number }>;
  dailyAverage: number;
}

export interface Expense {
  id: string;
  tripId: string;
  category: BudgetCategory;
  amount: number;
  currency: string;
  description: string;
  date: Timestamp;
  createdAt: Timestamp;
}

// ── Guest Plan ───────────────────────────────────────────────────────────────

export interface GuestPlan {
  shortCode: string;
  plan: Partial<ItineraryItem>[];
  query?: string;
  location?: GeoPoint;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  viewCount: number;
}

// ── Crowd Estimate ───────────────────────────────────────────────────────────

export type CrowdLevel = "low" | "medium" | "high";

// ── Deals ────────────────────────────────────────────────────────────────────

export type DealCategory = "flight" | "hotel" | "package" | "activity" | "bank_offer";

export interface Deal {
  id: string;
  title: string;
  description: string;
  category: DealCategory;
  destination?: string;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercent?: number;
  currency: string;
  provider: string;
  url?: string;
  validFrom: string;
  validUntil: string;
  tags?: string[];
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
