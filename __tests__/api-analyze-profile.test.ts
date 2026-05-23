import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("ai", () => ({
  generateText: vi.fn().mockResolvedValue({
    text: JSON.stringify({
      score: 72,
      headline: "Full Stack Developer com foco em TypeScript e React",
      strengths: ["Skills variadas", "Projetos configurados", "LinkedIn preenchido"],
      improvements: ["Adicionar bio", "Gerar posts", "Adicionar localização"],
      tip: "Escreva uma bio destacando sua especialidade.",
    }),
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
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: table === "profiles" ? {
          role_title: "Full Stack Developer",
          bio_long: null,
          location: null,
          linkedin_url: "https://linkedin.com/in/test",
          skills: [{ name: "TypeScript", count: 10 }],
          custom_skills: [],
          featured_repos: [{ name: "my-app" }, { name: "other-app" }],
        } : null,
      }),
      then: vi.fn().mockImplementation((cb) => Promise.resolve(cb({ data: [] }))),
    })),
  })),
}));

import { GET } from "../app/api/analyze-profile/route";

describe("GET /api/analyze-profile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when no JWT", async () => {
    const req = new Request("http://localhost/api/analyze-profile");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 with analysis object for authenticated user", async () => {
    const req = new Request("http://localhost/api/analyze-profile", {
      headers: { Authorization: "Bearer valid-jwt" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("score");
    expect(body).toHaveProperty("strengths");
    expect(body).toHaveProperty("improvements");
    expect(body).toHaveProperty("tip");
  });
});
