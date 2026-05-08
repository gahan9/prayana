import { render, screen } from "@testing-library/react";
import { Card } from "@/components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("applies base styling classes", () => {
    const { container } = render(<Card>Content</Card>);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("rounded-2xl");
    expect(div.className).toContain("bg-white");
    expect(div.className).toContain("shadow-sm");
  });

  it("passes through additional className", () => {
    const { container } = render(<Card className="my-custom">Content</Card>);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("my-custom");
  });

  it("renders multiple children", () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Body text</p>
      </Card>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body text")).toBeInTheDocument();
  });
});
