import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createAuthedServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-123" } },
      }),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    })),
  })),
}));

import { POST } from "../app/api/posts/route";

describe("POST /api/posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when Authorization header is missing", async () => {
    const req = new Request("http://localhost/api/posts", {
      method: "POST",
      body: JSON.stringify({ content: "some content" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when JWT is invalid", async () => {
    const { createAuthedServerClient } = await import("@/lib/supabase/client");
    vi.mocked(createAuthedServerClient).mockReturnValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);

    const req = new Request("http://localhost/api/posts", {
      method: "POST",
      body: JSON.stringify({ content: "content" }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer invalid_token",
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 201 when post is saved successfully", async () => {
    const req = new Request("http://localhost/api/posts", {
      method: "POST",
      body: JSON.stringify({
        repo_name: "my-repo",
        tone: "business",
        content: "Generated post content",
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid_jwt",
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("returns 400 when content is missing", async () => {
    const req = new Request("http://localhost/api/posts", {
      method: "POST",
      body: JSON.stringify({ repo_name: "my-repo", tone: "business" }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid_jwt",
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
