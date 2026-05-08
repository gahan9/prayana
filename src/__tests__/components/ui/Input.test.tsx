import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/Input";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("generates id from label when id not provided", () => {
    render(<Input label="First Name" />);
    const input = screen.getByLabelText("First Name");
    expect(input.id).toBe("first-name");
  });

  it("uses provided id over generated one", () => {
    render(<Input label="Email" id="custom-id" />);
    const input = screen.getByLabelText("Email");
    expect(input.id).toBe("custom-id");
  });

  it("binds value and fires onChange", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Input label="Name" onChange={onChange} />);
    const input = screen.getByLabelText("Name");
    await user.type(input, "hello");
    expect(onChange).toHaveBeenCalledTimes(5);
  });

  it("displays error message when provided", () => {
    render(<Input label="Email" error="Required field" />);
    expect(screen.getByText("Required field")).toBeInTheDocument();
  });

  it("applies error border class when error present", () => {
    render(<Input label="Email" error="Invalid" />);
    const input = screen.getByLabelText("Email");
    expect(input.className).toContain("border-red-400");
  });

  it("does not show error text when no error", () => {
    render(<Input label="Email" />);
    expect(screen.queryByText(/required|invalid/i)).not.toBeInTheDocument();
  });

  it("passes through additional props like placeholder", () => {
    render(<Input label="Search" placeholder="Type here..." />);
    expect(screen.getByPlaceholderText("Type here...")).toBeInTheDocument();
  });
});
