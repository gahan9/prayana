import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { GuestPlan, ItineraryItem, GeoPoint } from "@/types";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export function generateShortCode(length = 6): string {
  let code = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    code += CHARS[array[i] % CHARS.length];
  }
  return code;
}

export async function saveGuestPlan(
  plan: Partial<ItineraryItem>[],
  query?: string,
  location?: GeoPoint,
): Promise<string> {
  const shortCode = generateShortCode();
  const now = Timestamp.now();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  const expiresAt = Timestamp.fromMillis(now.toMillis() + threeDaysMs);

  const guestPlan: GuestPlan = {
    shortCode,
    plan,
    query,
    location,
    createdAt: now,
    expiresAt,
    viewCount: 0,
  };

  await setDoc(doc(db, "guestPlans", shortCode), guestPlan);
  return shortCode;
}

export async function getGuestPlan(shortCode: string): Promise<GuestPlan | null> {
  const snap = await getDoc(doc(db, "guestPlans", shortCode));
  if (!snap.exists()) return null;

  const data = snap.data() as GuestPlan;

  if (data.expiresAt.toMillis() < Date.now()) {
    return null;
  }

  return data;
}
