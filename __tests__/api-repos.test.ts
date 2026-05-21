import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            provider_token: "gho_fake_github_token",
            user: { user_metadata: { user_name: "BrunoSilvaSE" } },
          },
        },
        error: null,
      }),
    },
  })),
}));

global.fetch = vi.fn();

import { GET } from "../app/api/repos/route";

describe("GET /api/repos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns repos list on success", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          { id: 1, name: "my-project", description: "cool project", language: "TypeScript", stargazers_count: 5, updated_at: "2026-05-01", html_url: "https://github.com/BrunoSilvaSE/my-project", owner: { login: "BrunoSilvaSE" } },
        ]),
        { status: 200 }
      )
    );

    const req = new Request("http://localhost/api/repos");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("my-project");
  });

  it("returns 401 when no session", async () => {
    const { createBrowserClient } = await import("@/lib/supabase/client");
    vi.mocked(createBrowserClient).mockReturnValueOnce({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    } as never);

    const req = new Request("http://localhost/api/repos");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
