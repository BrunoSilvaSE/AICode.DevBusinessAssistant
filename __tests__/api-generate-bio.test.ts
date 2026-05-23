import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("ai", () => ({
  streamText: vi.fn().mockResolvedValue({
    toTextStreamResponse: vi.fn().mockReturnValue(
      new Response("Sou um desenvolvedor apaixonado por tecnologia.", { status: 200 })
    ),
  }),
}));

vi.mock("@ai-sdk/groq", () => ({
  createGroq: vi.fn(() => vi.fn()),
}));

vi.mock("@/lib/supabase/client", () => ({
  createAuthedServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          role_title: "Full Stack Developer",
          skills: [{ name: "TypeScript", count: 10 }, { name: "React", count: 8 }],
          custom_skills: ["AWS"],
          featured_repos: [{ name: "my-app", description: "A cool app" }],
        },
      }),
    })),
  })),
}));

import { POST } from "../app/api/generate-bio/route";

describe("POST /api/generate-bio", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when no JWT", async () => {
    const req = new Request("http://localhost/api/generate-bio", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 with streaming response for authenticated user with profile", async () => {
    const req = new Request("http://localhost/api/generate-bio", {
      method: "POST",
      headers: { Authorization: "Bearer valid-jwt" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
