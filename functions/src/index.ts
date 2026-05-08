import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { BigQuery } from "@google-cloud/bigquery";

admin.initializeApp();

const bq = new BigQuery();
const datasetId = "analytics";
const tableId = "trip_creations";

/**
 * Cloud Function triggered on trip creation.
 * Logs trip metadata to BigQuery for analytics.
 */
export const onTripCreated = functions.firestore
  .document("trips/{tripId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const tripId = context.params.tripId;

    const row = {
      trip_id: tripId,
      owner_id: data.ownerId,
      destination: data.destinations?.[0] || "unknown",
      budget: data.budget || 0,
      currency: data.currency || "INR",
      created_at: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
    };

    try {
      await bq.dataset(datasetId).table(tableId).insert([row]);
      console.log(`Logged trip ${tripId} to BigQuery`);
    } catch (error) {
      console.error("BigQuery insert error:", error);
      // Fail gracefully so as not to block other processes
    }
  });
