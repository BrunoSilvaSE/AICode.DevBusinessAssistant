import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Groq provider before importing the route
vi.mock("@ai-sdk/groq", () => ({
  createGroq: vi.fn(() => vi.fn(() => "mocked-model")),
}));

vi.mock("ai", () => ({
  streamText: vi.fn().mockResolvedValue({
    toTextStreamResponse: vi.fn().mockReturnValue(
      new Response("streamed post content", { status: 200 })
    ),
  }),
}));

import { POST } from "../app/api/generate-post/route";

describe("POST /api/generate-post", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when input is missing", async () => {
    const req = new Request("http://localhost/api/generate-post", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when input is too short", async () => {
    const req = new Request("http://localhost/api/generate-post", {
      method: "POST",
      body: JSON.stringify({ input: "hi" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns a streaming response for valid input", async () => {
    const req = new Request("http://localhost/api/generate-post", {
      method: "POST",
      body: JSON.stringify({
        input: "Refatorei o sistema de autenticação para usar JWT com refresh tokens",
        tone: "business",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("accepts tone 'technical' as valid", async () => {
    const req = new Request("http://localhost/api/generate-post", {
      method: "POST",
      body: JSON.stringify({
        input: "Implementei cache distribuído com Redis para reduzir latência em 60%",
        tone: "technical",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
