import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
vi.mock("@/lib/supabase/client", () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: "user-123" },
          },
        },
        error: null,
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

  it("returns 201 when post is saved successfully", async () => {
    const req = new Request("http://localhost/api/posts", {
      method: "POST",
      body: JSON.stringify({
        repo_name: "my-repo",
        tone: "business",
        content: "Generated post content",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("returns 400 when content is missing", async () => {
    const req = new Request("http://localhost/api/posts", {
      method: "POST",
      body: JSON.stringify({
        repo_name: "my-repo",
        tone: "business",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    const { createBrowserClient } = await import("@/lib/supabase/client");
    vi.mocked(createBrowserClient).mockReturnValueOnce({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    } as never);

    const req = new Request("http://localhost/api/posts", {
      method: "POST",
      body: JSON.stringify({
        repo_name: "my-repo",
        tone: "business",
        content: "content",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
