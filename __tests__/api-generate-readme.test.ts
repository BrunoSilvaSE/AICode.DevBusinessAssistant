import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("ai", () => ({
  streamText: vi.fn().mockResolvedValue({
    toTextStreamResponse: vi.fn().mockReturnValue(new Response("# My Repo\n\nGreat project.", { status: 200 })),
  }),
}));

vi.mock("@ai-sdk/groq", () => ({
  createGroq: vi.fn(() => vi.fn()),
}));

import { POST } from "../app/api/generate-readme/route";

describe("POST /api/generate-readme", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when repoName is missing", async () => {
    const req = new Request("http://localhost/api/generate-readme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with a streaming response", async () => {
    const req = new Request("http://localhost/api/generate-readme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoName: "my-project",
        description: "A cool project",
        languages: ["TypeScript", "CSS"],
        readme: "Old readme content",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
