import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("ai", () => ({
  streamText: vi.fn().mockResolvedValue({
    toTextStreamResponse: vi.fn().mockReturnValue(
      new Response("flowchart TD\n    U[Usuário] --> FE[Frontend]", { status: 200 })
    ),
  }),
}));

vi.mock("@ai-sdk/groq", () => ({
  createGroq: vi.fn(() => vi.fn()),
}));

import { POST } from "../app/api/generate-diagram/route";

describe("POST /api/generate-diagram", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when repoName is missing", async () => {
    const req = new Request("http://localhost/api/generate-diagram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 200 with a streaming response for valid input", async () => {
    const req = new Request("http://localhost/api/generate-diagram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoName: "my-project",
        description: "A Next.js app",
        languages: ["TypeScript", "CSS"],
        readme: "# My Project\n\nA cool project.",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("returns 200 even with minimal input (only repoName)", async () => {
    const req = new Request("http://localhost/api/generate-diagram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoName: "minimal-repo" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
