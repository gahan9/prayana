/**
 * @jest-environment node
 */

import { generateTripPdf } from "@/lib/pdf-generator";
import type { PdfTripData } from "@/lib/pdf-generator";

const MINIMAL_TRIP: PdfTripData = {
  title: "Weekend in Goa",
  destinations: ["Goa"],
  days: [
    {
      day: 1,
      date: "2026-06-01",
      items: [
        { time: "09:00", title: "Beach Walk", description: "Morning walk at Calangute", category: "activity" },
        { title: "Lunch at Britto's", category: "food", cost: 800, currency: "₹" },
      ],
    },
  ],
};

const FULL_TRIP: PdfTripData = {
  title: "Rajasthan Heritage Tour",
  destinations: ["Jaipur", "Udaipur", "Jodhpur"],
  dateRange: { start: "2026-07-01", end: "2026-07-07" },
  travelers: 4,
  days: [
    {
      day: 1,
      date: "2026-07-01",
      items: [
        { time: "06:00", title: "Flight to Jaipur", category: "transport", cost: 4500, currency: "₹" },
        { time: "10:00", title: "Amber Fort", description: "Guided tour of the fort", category: "sightseeing", cost: 500, currency: "₹" },
        { time: "13:00", title: "Rajasthani Thali", category: "food", cost: 600, currency: "₹" },
        { time: "15:00", title: "Hawa Mahal", category: "sightseeing" },
      ],
    },
    {
      day: 2,
      date: "2026-07-02",
      items: [
        { time: "08:00", title: "City Palace", description: "Royal museum visit", category: "sightseeing", cost: 700, currency: "₹" },
        { time: "12:00", title: "Street Food Tour", category: "food", cost: 300, currency: "₹" },
      ],
    },
  ],
  budget: {
    totalBudget: 50000,
    currency: "INR",
    categories: [
      { name: "Accommodation", planned: 15000, actual: 14500 },
      { name: "Food", planned: 8000, actual: 9200 },
      { name: "Transport", planned: 12000, actual: 11000 },
      { name: "Activities", planned: 10000 },
      { name: "Shopping", planned: 3000 },
      { name: "Contingency", planned: 2000 },
    ],
  },
  notes: "Remember to carry sunscreen and comfortable walking shoes. Book Amber Fort tickets online to skip the queue.",
  generatedBy: "Prayana Test Suite",
};

describe("pdf-generator", () => {
  describe("generateTripPdf", () => {
    it("generates a valid PDF blob from minimal trip data", () => {
      const blob = generateTripPdf(MINIMAL_TRIP);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
      expect(blob.type).toBe("application/pdf");
    });

    it("generates a PDF from full trip data with budget and notes", () => {
      const blob = generateTripPdf(FULL_TRIP);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
      // Full trip with budget + notes should produce a larger PDF than minimal
      const minimalBlob = generateTripPdf(MINIMAL_TRIP);
      expect(blob.size).toBeGreaterThan(minimalBlob.size);
    });

    it("handles trip with empty itinerary days", () => {
      const emptyTrip: PdfTripData = {
        title: "Empty Trip",
        destinations: ["Nowhere"],
        days: [],
      };

      const blob = generateTripPdf(emptyTrip);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });

    it("handles long descriptions without crashing", () => {
      const longDescTrip: PdfTripData = {
        title: "Descriptive Trip",
        destinations: ["Varanasi"],
        days: [
          {
            day: 1,
            items: [
              {
                title: "Ghat Walk",
                description: "A very long description. ".repeat(100),
                category: "sightseeing",
              },
            ],
          },
        ],
      };

      expect(() => generateTripPdf(longDescTrip)).not.toThrow();
    });

    it("handles multiple days with many items (page overflow)", () => {
      const manyItemsTrip: PdfTripData = {
        title: "Packed Trip",
        destinations: ["Mumbai"],
        days: Array.from({ length: 5 }, (_, i) => ({
          day: i + 1,
          date: `2026-08-0${i + 1}`,
          items: Array.from({ length: 10 }, (_, j) => ({
            time: `${8 + j}:00`,
            title: `Activity ${j + 1}`,
            description: `Description for activity ${j + 1} on day ${i + 1}`,
            category: "activity",
            cost: (j + 1) * 100,
            currency: "₹",
          })),
        })),
      };

      const blob = generateTripPdf(manyItemsTrip);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });

    it("handles trip without optional fields", () => {
      const noOptionals: PdfTripData = {
        title: "Basic Trip",
        destinations: ["Delhi"],
        days: [
          {
            day: 1,
            items: [{ title: "Sightseeing" }],
          },
        ],
      };

      const blob = generateTripPdf(noOptionals);
      expect(blob).toBeInstanceOf(Blob);
    });

    it("handles budget with over-budget categories", () => {
      const overBudgetTrip: PdfTripData = {
        title: "Over Budget Trip",
        destinations: ["Paris"],
        days: [],
        budget: {
          totalBudget: 10000,
          currency: "EUR",
          categories: [
            { name: "Food", planned: 2000, actual: 3500 },
            { name: "Hotel", planned: 5000, actual: 4800 },
          ],
        },
      };

      expect(() => generateTripPdf(overBudgetTrip)).not.toThrow();
    });
  });
});
