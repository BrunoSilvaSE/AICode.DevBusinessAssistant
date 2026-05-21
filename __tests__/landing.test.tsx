import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LandingPage from "../app/page";

describe("Landing Page", () => {
  it("renders the main heading", () => {
    render(<LandingPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("has a CTA link pointing to /login", () => {
    render(<LandingPage />);
    const cta = screen.getByRole("link", { name: /entrar com github/i });
    expect(cta).toHaveAttribute("href", "/login");
  });

  it("shows the product value proposition", () => {
    render(<LandingPage />);
    expect(screen.getByText(/github para marca pessoal/i)).toBeInTheDocument();
  });
});
