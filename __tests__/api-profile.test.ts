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
            data: {
              bio_long: "Sou desenvolvedor full stack.",
              role_title: "Full Stack Developer",
              linkedin_url: null,
              location: "São Paulo, SP",
            },
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

import { GET, PATCH } from "../app/api/profile/route";

describe("GET /api/profile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without auth", async () => {
    const res = await GET(new Request("http://localhost/api/profile"));
    expect(res.status).toBe(401);
  });

  it("returns profile fields", async () => {
    const res = await GET(
      new Request("http://localhost/api/profile", {
        headers: { Authorization: "Bearer jwt" },
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("role_title");
    expect(data).toHaveProperty("bio_long");
  });
});

describe("PATCH /api/profile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without auth", async () => {
    const res = await PATCH(new Request("http://localhost/api/profile", { method: "PATCH" }));
    expect(res.status).toBe(401);
  });

  it("updates profile successfully with valid fields", async () => {
    const res = await PATCH(
      new Request("http://localhost/api/profile", {
        method: "PATCH",
        headers: { Authorization: "Bearer jwt", "Content-Type": "application/json" },
        body: JSON.stringify({
          role_title: "Engenheiro de Software",
          bio_long: "Desenvolvedor com 5 anos de experiência.",
          location: "Recife, PE",
          linkedin_url: "",
        }),
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("returns 400 when bio_long exceeds limit", async () => {
    const res = await PATCH(
      new Request("http://localhost/api/profile", {
        method: "PATCH",
        headers: { Authorization: "Bearer jwt", "Content-Type": "application/json" },
        body: JSON.stringify({ bio_long: "x".repeat(3001) }),
      })
    );
    expect(res.status).toBe(400);
  });

  it("accepts null values to clear fields", async () => {
    const res = await PATCH(
      new Request("http://localhost/api/profile", {
        method: "PATCH",
        headers: { Authorization: "Bearer jwt", "Content-Type": "application/json" },
        body: JSON.stringify({ role_title: null, linkedin_url: null }),
      })
    );
    expect(res.status).toBe(200);
  });
});
