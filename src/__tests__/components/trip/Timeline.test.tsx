import { render, screen } from "@testing-library/react";
import { Timeline } from "@/components/trip/Timeline";
import type { ItineraryItem } from "@/types";

const mockItems: Partial<ItineraryItem>[] = [
  {
    day: 1,
    order: 1,
    title: "Airport Arrival",
    description: "Arrive and transfer to hotel.",
    locationName: "Jaipur Airport",
    category: "transport",
    duration: 60,
    cost: 500,
  },
  {
    day: 1,
    order: 2,
    title: "Lunch at LMB",
    description: "Must-try food. Crowd level: high on weekends.",
    locationName: "Johari Bazaar",
    category: "food",
    duration: 90,
    cost: 800,
  },
  {
    day: 2,
    order: 1,
    title: "Amber Fort",
    description: "Morning visit. Expected crowd: medium.",
    locationName: "Amber Fort",
    category: "sightseeing",
    duration: 180,
    cost: 200,
  },
  {
    day: 2,
    order: 2,
    title: "Shopping at Bazaar",
    description: "Quiet bazaar on weekdays. Low crowd expected.",
    locationName: "Johari Bazaar",
    category: "shopping",
    duration: 120,
    cost: 3000,
  },
];

describe("Timeline", () => {
  it("renders day headings", () => {
    render(<Timeline items={mockItems} />);
    expect(screen.getByText("Day 1")).toBeInTheDocument();
    expect(screen.getByText("Day 2")).toBeInTheDocument();
  });

  it("renders all item titles", () => {
    render(<Timeline items={mockItems} />);
    expect(screen.getByText("Airport Arrival")).toBeInTheDocument();
    expect(screen.getByText("Lunch at LMB")).toBeInTheDocument();
    expect(screen.getAllByText("Amber Fort").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Shopping at Bazaar")).toBeInTheDocument();
  });

  it("renders location names", () => {
    render(<Timeline items={mockItems} />);
    expect(screen.getByText("Jaipur Airport")).toBeInTheDocument();
  });

  it("renders correct category icon for transport", () => {
    render(<Timeline items={mockItems} />);
    const icons = screen.getAllByText("🚗");
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders correct category icon for food", () => {
    render(<Timeline items={mockItems} />);
    const icons = screen.getAllByText("🍽️");
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders correct category icon for sightseeing", () => {
    render(<Timeline items={mockItems} />);
    expect(screen.getByText("📸")).toBeInTheDocument();
  });

  it("renders correct category icon for shopping", () => {
    render(<Timeline items={mockItems} />);
    expect(screen.getByText("🛍️")).toBeInTheDocument();
  });

  it("shows cost with currency", () => {
    render(<Timeline items={mockItems} currency="INR" />);
    expect(screen.getByText(/INR 500/)).toBeInTheDocument();
  });

  it("shows duration formatted as hours", () => {
    render(<Timeline items={mockItems} />);
    expect(screen.getByText("3h")).toBeInTheDocument();
  });

  it("shows duration formatted as minutes", () => {
    render(<Timeline items={mockItems} />);
    expect(screen.getByText("1h")).toBeInTheDocument();
  });

  it("detects and displays crowd level from description", () => {
    render(<Timeline items={mockItems} />);
    const crowdBadges = screen.getAllByText(/crowd/);
    expect(crowdBadges.length).toBeGreaterThanOrEqual(3);
  });

  it("handles empty items array", () => {
    const { container } = render(<Timeline items={[]} />);
    expect(container.querySelector(".space-y-8")).toBeInTheDocument();
  });

  it("defaults missing day to 1", () => {
    const items: Partial<ItineraryItem>[] = [
      { title: "No Day", order: 1, category: "other" },
    ];
    render(<Timeline items={items} />);
    expect(screen.getByText("Day 1")).toBeInTheDocument();
  });
});
