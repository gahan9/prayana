"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onTripCreated = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const bigquery_1 = require("@google-cloud/bigquery");
admin.initializeApp();
const bq = new bigquery_1.BigQuery();
const datasetId = "analytics";
const tableId = "trip_creations";
/**
 * Cloud Function triggered on trip creation.
 * Logs trip metadata to BigQuery for analytics.
 */
exports.onTripCreated = functions.firestore
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
    }
    catch (error) {
        console.error("BigQuery insert error:", error);
        // Fail gracefully so as not to block other processes
    }
});
//# sourceMappingURL=index.js.map