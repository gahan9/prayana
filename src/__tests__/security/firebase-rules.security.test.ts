import * as fs from "fs";
import * as path from "path";

const rulesPath = path.resolve(process.cwd(), "firestore.rules");
const envExamplePath = path.resolve(process.cwd(), ".env.example");

describe("[security] Firestore security rules", () => {
  const rules = fs.readFileSync(rulesPath, "utf-8");

  describe("authentication enforcement", () => {
    it("users collection requires owner authentication", () => {
      expect(rules).toContain("match /users/{userId}");
      expect(rules).toContain("isOwner(userId)");
    });

    it("trips collection requires authentication for writes", () => {
      expect(rules).toContain("match /trips/{tripId}");
      expect(rules).toContain("isAuthenticated()");
    });

    it("trips require email verification for creation", () => {
      expect(rules).toContain("isValidEmail()");
    });

    it("trips enforce owner check on ownerId", () => {
      expect(rules).toContain("incomingData().ownerId == request.auth.uid");
    });
  });

  describe("guest plans security", () => {
    it("guest plans are world-readable", () => {
      const guestSection = rules.substring(
        rules.indexOf("match /guestPlans/{shortCode}"),
      );
      expect(guestSection).toContain("allow read: if true");
    });

    it("guest plans allow creation", () => {
      const guestSection = rules.substring(
        rules.indexOf("match /guestPlans/{shortCode}"),
      );
      expect(guestSection).toContain("allow create: if true");
    });

    it("guest plans block updates and deletes", () => {
      const guestSection = rules.substring(
        rules.indexOf("match /guestPlans/{shortCode}"),
      );
      expect(guestSection).toContain("allow update, delete: if false");
    });
  });

  describe("default deny rule", () => {
    it("has a default deny-all rule", () => {
      expect(rules).toContain("match /{document=**}");
      expect(rules).toContain("allow read, write: if false");
    });
  });

  describe("field validation", () => {
    it("validates displayName length on user creation", () => {
      expect(rules).toContain("isNotTooLarge(incomingData().displayName, 100)");
    });

    it("validates title length on trip creation", () => {
      expect(rules).toContain("isNotTooLarge(incomingData().title, 200)");
    });

    it("validates visibility enum on trips", () => {
      expect(rules).toContain("incomingData().visibility in ['public', 'private', 'shared']");
    });

    it("validates review rating range", () => {
      expect(rules).toContain("incomingData().rating >= 1");
      expect(rules).toContain("incomingData().rating <= 5");
    });
  });

  describe("immutable fields", () => {
    it("prevents uid mutation on user updates", () => {
      expect(rules).toContain("incomingData().uid == existingData().uid");
    });

    it("prevents email mutation on user updates", () => {
      expect(rules).toContain("incomingData().email == existingData().email");
    });

    it("prevents ownerId mutation on trip updates", () => {
      expect(rules).toContain("incomingData().ownerId == existingData().ownerId");
    });
  });

  describe("destinations are read-only", () => {
    it("blocks all writes to destinations", () => {
      const destSection = rules.substring(
        rules.indexOf("match /destinations/{destinationId}"),
      );
      expect(destSection).toContain("allow write: if false");
    });
  });
});

describe("[security] .env.example secret check", () => {
  const envContent = fs.readFileSync(envExamplePath, "utf-8");

  it("does not contain real Firebase API keys", () => {
    const realKeyPattern = /AIza[0-9A-Za-z_-]{35}/;
    expect(envContent).not.toMatch(realKeyPattern);
  });

  it("does not contain real Firebase project IDs", () => {
    expect(envContent).not.toMatch(/\b[a-z]+-[a-z]+-[a-f0-9]{6}\b/);
  });

  it("uses placeholder values", () => {
    expect(envContent).toContain("your_");
  });

  it("does not contain bearer tokens", () => {
    expect(envContent).not.toMatch(/Bearer\s+[A-Za-z0-9._-]+/);
  });
});
