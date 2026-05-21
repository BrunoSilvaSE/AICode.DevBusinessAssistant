import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: "user-123",
            email: "dev@example.com",
            user_metadata: { full_name: "Bruno Silva" },
          },
        },
        error: null,
      }),
    },
  })),
}));

import DashboardPage from "../app/dashboard/page";

describe("Dashboard Page", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders loading state initially", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it("shows greeting with user name after session loads", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/olá.*bruno silva/i)).toBeInTheDocument();
    });
  });

  it("redirects to /login when no user session", async () => {
    const { createBrowserClient } = await import("@/lib/supabase/client");
    vi.mocked(createBrowserClient).mockReturnValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as never);

    render(<DashboardPage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
