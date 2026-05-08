import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("fires onClick handler", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Press</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick} disabled>Press</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies primary variant classes by default", () => {
    render(<Button>Go</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-brand-600");
  });

  it("applies secondary variant classes", () => {
    render(<Button variant="secondary">Go</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-white");
    expect(btn.className).toContain("border");
  });

  it("applies ghost variant classes", () => {
    render(<Button variant="ghost">Go</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-transparent");
  });

  it("applies disabled styling when disabled", () => {
    render(<Button disabled>Go</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn.className).toContain("disabled:opacity-50");
  });

  it("passes through additional className", () => {
    render(<Button className="mt-4">Go</Button>);
    expect(screen.getByRole("button").className).toContain("mt-4");
  });
});
