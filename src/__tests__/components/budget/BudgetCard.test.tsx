import { render, screen } from "@testing-library/react";
import { BudgetCard } from "@/components/budget/BudgetCard";
import type { BudgetBreakdown } from "@/types";

const mockBudget: BudgetBreakdown = {
  totalBudget: 15000,
  currency: "INR",
  categories: {
    accommodation: { planned: 4500, actual: 1000 },
    food: { planned: 3000, actual: 500 },
    transport: { planned: 2000, actual: 0 },
    activities: { planned: 3000, actual: 200 },
    shopping: { planned: 1500, actual: 0 },
    contingency: { planned: 1000, actual: 0 },
  },
  dailyAverage: 5000,
};

describe("BudgetCard", () => {
  it("renders the budget heading", () => {
    render(<BudgetCard budget={mockBudget} />);
    expect(screen.getByText("Budget")).toBeInTheDocument();
  });

  it("displays daily average with currency", () => {
    render(<BudgetCard budget={mockBudget} />);
    expect(screen.getByText(/5,000\/day/)).toBeInTheDocument();
  });

  it("displays total budget", () => {
    render(<BudgetCard budget={mockBudget} />);
    expect(screen.getByText("Total Budget")).toBeInTheDocument();
    expect(screen.getByText(/15,000/)).toBeInTheDocument();
  });

  it("calculates spent correctly", () => {
    render(<BudgetCard budget={mockBudget} />);
    expect(screen.getByText("Spent")).toBeInTheDocument();
    expect(screen.getByText(/1,700/)).toBeInTheDocument();
  });

  it("calculates remaining correctly", () => {
    render(<BudgetCard budget={mockBudget} />);
    expect(screen.getByText("Remaining")).toBeInTheDocument();
    expect(screen.getByText(/13,300/)).toBeInTheDocument();
  });

  it("shows green text when remaining is positive", () => {
    render(<BudgetCard budget={mockBudget} />);
    const remaining = screen.getByText(/13,300/);
    expect(remaining.className).toContain("text-green-600");
  });

  it("shows red text when overspent", () => {
    const overBudget: BudgetBreakdown = {
      ...mockBudget,
      totalBudget: 1000,
      categories: {
        accommodation: { planned: 300, actual: 500 },
        food: { planned: 200, actual: 400 },
        transport: { planned: 150, actual: 200 },
        activities: { planned: 200, actual: 100 },
        shopping: { planned: 100, actual: 50 },
        contingency: { planned: 50, actual: 0 },
      },
    };
    render(<BudgetCard budget={overBudget} />);
    const remainingValues = screen.getAllByText(/250/);
    const redEl = remainingValues.find((el) =>
      el.className.includes("text-red-600"),
    );
    expect(redEl).toBeTruthy();
  });

  it("renders all six category labels", () => {
    render(<BudgetCard budget={mockBudget} />);
    expect(screen.getByText("accommodation")).toBeInTheDocument();
    expect(screen.getByText("food")).toBeInTheDocument();
    expect(screen.getByText("transport")).toBeInTheDocument();
    expect(screen.getByText("activities")).toBeInTheDocument();
    expect(screen.getByText("shopping")).toBeInTheDocument();
    expect(screen.getByText("contingency")).toBeInTheDocument();
  });
});
