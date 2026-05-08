import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Trip, ItineraryItem } from "@/types";

const tripsCol = collection(db, "trips");

export async function createTrip(
  ownerId: string,
  data: Omit<Trip, "id" | "ownerId" | "createdAt">,
): Promise<string> {
  const ref = await addDoc(tripsCol, {
    ...data,
    ownerId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getTrip(tripId: string): Promise<Trip | null> {
  const snap = await getDoc(doc(db, "trips", tripId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Trip;
}

export async function getUserTrips(userId: string): Promise<Trip[]> {
  const q = query(tripsCol, where("ownerId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Trip);
}

export async function updateTrip(tripId: string, data: Partial<Trip>): Promise<void> {
  await updateDoc(doc(db, "trips", tripId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTrip(tripId: string): Promise<void> {
  await deleteDoc(doc(db, "trips", tripId));
}

export async function getItinerary(tripId: string): Promise<ItineraryItem[]> {
  const col = collection(db, "trips", tripId, "itinerary");
  const q = query(col, orderBy("day"), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ItineraryItem);
}

export async function addItineraryItem(
  tripId: string,
  item: Omit<ItineraryItem, "id" | "createdAt">,
): Promise<string> {
  const col = collection(db, "trips", tripId, "itinerary");
  const ref = await addDoc(col, { ...item, createdAt: serverTimestamp() });
  return ref.id;
}
