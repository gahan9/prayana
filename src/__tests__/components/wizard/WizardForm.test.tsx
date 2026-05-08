import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WizardForm } from "@/components/wizard/WizardForm";

describe("WizardForm", () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    onSubmit.mockClear();
  });

  it("renders step 0 (Where & When) by default", () => {
    render(<WizardForm onSubmit={onSubmit} />);
    expect(screen.getByText("Where & When")).toBeInTheDocument();
    expect(screen.getByLabelText("Destination")).toBeInTheDocument();
  });

  it("disables Next button when fields are empty", () => {
    render(<WizardForm onSubmit={onSubmit} />);
    const nextBtn = screen.getByRole("button", { name: "Next" });
    expect(nextBtn).toBeDisabled();
  });

  it("navigates to step 1 when fields filled and Next clicked", async () => {
    const user = userEvent.setup();
    render(<WizardForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Destination"), "Jaipur");
    await user.type(screen.getByLabelText("Start Date"), "2026-06-01");
    await user.type(screen.getByLabelText("End Date"), "2026-06-03");

    const nextBtn = screen.getByRole("button", { name: "Next" });
    await user.click(nextBtn);

    expect(screen.getByText("Budget & Group")).toBeInTheDocument();
  });

  it("navigates back from step 1 to step 0", async () => {
    const user = userEvent.setup();
    render(<WizardForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Destination"), "Jaipur");
    await user.type(screen.getByLabelText("Start Date"), "2026-06-01");
    await user.type(screen.getByLabelText("End Date"), "2026-06-03");
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Budget & Group")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("Where & When")).toBeInTheDocument();
  });

  it("shows step indicator with 3 segments", () => {
    const { container } = render(<WizardForm onSubmit={onSubmit} />);
    const indicators = container.querySelectorAll(".flex.gap-1 > div");
    expect(indicators.length).toBe(3);
  });

  it("shows loading state on submit button", async () => {
    const user = userEvent.setup();
    render(<WizardForm onSubmit={onSubmit} loading />);

    await user.type(screen.getByLabelText("Destination"), "Goa");
    await user.type(screen.getByLabelText("Start Date"), "2026-07-01");
    await user.type(screen.getByLabelText("End Date"), "2026-07-03");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Generating...")).toBeInTheDocument();
  });

  it("renders result view when result is provided", () => {
    const result = {
      itinerary: [
        { day: 1, order: 1, title: "Test Item", category: "food" as const, cost: 100 },
      ],
      budget: {
        totalBudget: 5000,
        currency: "INR",
        categories: {
          accommodation: { planned: 1500, actual: 0 },
          food: { planned: 1000, actual: 0 },
          transport: { planned: 750, actual: 0 },
          activities: { planned: 1000, actual: 0 },
          shopping: { planned: 500, actual: 0 },
          contingency: { planned: 250, actual: 0 },
        },
        dailyAverage: 5000,
      },
    };
    render(<WizardForm onSubmit={onSubmit} result={result} />);
    expect(screen.getByText("Your Itinerary")).toBeInTheDocument();
    expect(screen.getByText("Test Item")).toBeInTheDocument();
    expect(screen.getByText("Modify")).toBeInTheDocument();
  });
});
