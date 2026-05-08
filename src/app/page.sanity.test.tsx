import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("frontend sanity", () => {
  it("renders core landing page content", () => {
    render(<HomePage />);
    expect(screen.getAllByText("Prayana").length).toBeGreaterThan(0);
    expect(screen.getByText("Start planning for free")).toBeTruthy();
  });
});
