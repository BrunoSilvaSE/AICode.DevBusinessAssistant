import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createAuthedServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { featured_repos: [] },
            error: null,
          }),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  })),
}));

import { GET, PUT } from "../app/api/featured-repos/route";

describe("GET /api/featured-repos", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without auth", async () => {
    const res = await GET(new Request("http://localhost/api/featured-repos"));
    expect(res.status).toBe(401);
  });

  it("returns featured repos array", async () => {
    const res = await GET(
      new Request("http://localhost/api/featured-repos", {
        headers: { Authorization: "Bearer jwt" },
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe("PUT /api/featured-repos", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without auth", async () => {
    const res = await PUT(new Request("http://localhost/api/featured-repos", { method: "PUT" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when repos is not an array", async () => {
    const res = await PUT(
      new Request("http://localhost/api/featured-repos", {
        method: "PUT",
        headers: { Authorization: "Bearer jwt", "Content-Type": "application/json" },
        body: JSON.stringify({ repos: "invalid" }),
      })
    );
    expect(res.status).toBe(400);
  });

  it("accepts more than 3 repos", async () => {
    const repo = { name: "r", full_name: "u/r", description: null, html_url: "https://github.com/u/r", language: "JS", stargazers_count: 0 };
    const res = await PUT(
      new Request("http://localhost/api/featured-repos", {
        method: "PUT",
        headers: { Authorization: "Bearer jwt", "Content-Type": "application/json" },
        body: JSON.stringify({ repos: [repo, repo, repo, repo, repo] }),
      })
    );
    expect(res.status).toBe(200);
  });

  it("saves repos and returns 200", async () => {
    const res = await PUT(
      new Request("http://localhost/api/featured-repos", {
        method: "PUT",
        headers: { Authorization: "Bearer jwt", "Content-Type": "application/json" },
        body: JSON.stringify({
          repos: [
            { name: "my-repo", full_name: "user/my-repo", description: "cool", html_url: "https://github.com/user/my-repo", language: "TypeScript", stargazers_count: 5 },
          ],
        }),
      })
    );
    expect(res.status).toBe(200);
  });
});
