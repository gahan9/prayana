/**
 * Firebase singleton initialisation.
 *
 * Import the specific service you need – e.g.:
 *   import { db } from '@/lib/firebase';
 *
 * The Firebase app is initialised only once (singleton pattern),
 * whether running in a browser or in a Next.js server component.
 */

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
  type FirebaseStorage,
} from "firebase/storage";
import { getAnalytics, type Analytics, isSupported } from "firebase/analytics";
import { getPerformance, type FirebasePerformance } from "firebase/performance";

// ── Configuration ─────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// ── Singleton initialisation ──────────────────────────────────────────────────

function createFirebaseApp(): FirebaseApp | null {
  if (!isConfigured) return null;
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }
  return initializeApp(firebaseConfig);
}

const app: FirebaseApp | null = createFirebaseApp();

// ── Service exports ───────────────────────────────────────────────────────────
// Services are null-safe: when Firebase is not configured (build time, missing env
// vars), callers must guard against null. Client components should check `isConfigured`.

export const auth: Auth | null = app ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;
export const storage: FirebaseStorage | null = app ? getStorage(app) : null;

export { isConfigured };

/**
 * Analytics is only available in the browser and only when supported.
 * Wrap usage in an async function:
 *   const analytics = await getFirebaseAnalytics();
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined" || !app) return null;
  const supported = await isSupported();
  if (!supported) return null;
  return getAnalytics(app);
}

/**
 * Performance Monitoring initialization.
 * Only available in the browser.
 */
export function getFirebasePerformance(): FirebasePerformance | null {
  if (typeof window === "undefined" || !app) return null;
  return getPerformance(app);
}

// ── Local emulator wiring (development only) ──────────────────────────────────

if (
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" &&
  typeof window !== "undefined" &&
  auth && db && storage
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(auth as any)._canInitEmulator === false) {
    connectAuthEmulator(auth, "http://localhost:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
  }
}

export default app;
