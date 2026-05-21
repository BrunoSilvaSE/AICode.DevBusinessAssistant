import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: vi.fn(),
    },
  })),
}));

import LoginPage from "../app/login/page";

describe("Login Page", () => {
  it("renders the GitHub login button", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /continuar com github/i })
    ).toBeInTheDocument();
  });

  it("shows the product name", () => {
    render(<LoginPage />);
    expect(screen.getByText(/dev business assistant/i)).toBeInTheDocument();
  });

  it("renders a descriptive subtitle", () => {
    render(<LoginPage />);
    expect(screen.getByText(/portfólio/i)).toBeInTheDocument();
  });
});
