import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createAuthedServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}));

global.fetch = vi.fn();

import { POST } from "../app/api/sync-profile/route";

describe("POST /api/sync-profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when Authorization header is missing", async () => {
    const req = new Request("http://localhost/api/sync-profile", {
      method: "POST",
      headers: { "X-GitHub-Token": "gho_fake" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when X-GitHub-Token header is missing", async () => {
    const req = new Request("http://localhost/api/sync-profile", {
      method: "POST",
      headers: { Authorization: "Bearer jwt" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 on success", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            { language: "TypeScript" },
            { language: "TypeScript" },
            { language: "Python" },
          ]),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ bio: "Dev" }),
          { status: 200 }
        )
      );

    const req = new Request("http://localhost/api/sync-profile", {
      method: "POST",
      body: JSON.stringify({
        userId: "user-123",
        username: "devuser",
        fullName: "Dev User",
        avatarUrl: "https://example.com/avatar.jpg",
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid_jwt",
        "X-GitHub-Token": "gho_fake",
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
