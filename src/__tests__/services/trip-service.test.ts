import {
  createTrip,
  getTrip,
  getUserTrips,
} from "@/services/trip-service";
import { addDoc, getDoc, getDocs } from "firebase/firestore";

// Mock Firebase
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => ({ id: "mock-col" })),
  doc: jest.fn(() => ({ id: "mock-doc" })),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => "timestamp"),
}));

jest.mock("@/lib/firebase", () => ({
  db: {},
}));

describe("trip-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTrip", () => {
    it("successfully creates a trip and returns the ID", async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: "new-trip-id" });
      
      const tripData = {
        title: "Test Trip",
        destinations: ["Paris"],
        budget: 5000,
        currency: "USD",
        visibility: "public" as const,
      };

      const result = await createTrip("user-123", tripData);
      
      expect(result).toBe("new-trip-id");
      expect(addDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        ...tripData,
        ownerId: "user-123",
        createdAt: "timestamp",
      }));
    });
  });

  describe("getTrip", () => {
    it("returns trip data when trip exists", async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: "trip-123",
        data: () => ({ title: "Existing Trip", ownerId: "user-1" }),
      });

      const result = await getTrip("trip-123");
      
      expect(result).toEqual({
        id: "trip-123",
        title: "Existing Trip",
        ownerId: "user-1",
      });
    });

    it("returns null when trip does not exist", async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await getTrip("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("getUserTrips", () => {
    it("returns an array of trips for the user", async () => {
      (getDocs as jest.Mock).mockResolvedValue({
        docs: [
          { id: "t1", data: () => ({ title: "Trip 1" }) },
          { id: "t2", data: () => ({ title: "Trip 2" }) },
        ],
      });

      const result = await getUserTrips("user-1");
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: "t1", title: "Trip 1" });
      expect(result[1]).toEqual({ id: "t2", title: "Trip 2" });
    });

    it("returns an empty array if no trips found", async () => {
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
      const result = await getUserTrips("user-none");
      expect(result).toEqual([]);
    });
  });
});
