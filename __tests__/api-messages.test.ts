import { describe, it, expect, vi, beforeEach } from "vitest";

const mockMessages = [
  { id: "msg-1", sender_name: "Maria", sender_contact: "maria@test.com", message: "Oi!", read: false, created_at: "2026-05-22T10:00:00Z" },
];

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
          order: vi.fn(() => Promise.resolve({ data: mockMessages, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      })),
    })),
  })),
}));

import { GET, PATCH, DELETE } from "../app/api/messages/route";

describe("GET /api/messages", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without auth", async () => {
    const res = await GET(new Request("http://localhost/api/messages"));
    expect(res.status).toBe(401);
  });

  it("returns messages array", async () => {
    const res = await GET(
      new Request("http://localhost/api/messages", {
        headers: { Authorization: "Bearer jwt" },
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe("PATCH /api/messages", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without auth", async () => {
    const res = await PATCH(
      new Request("http://localhost/api/messages", { method: "PATCH" })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when id is missing", async () => {
    const res = await PATCH(
      new Request("http://localhost/api/messages", {
        method: "PATCH",
        headers: { Authorization: "Bearer jwt", "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
  });

  it("marks message as read", async () => {
    const res = await PATCH(
      new Request("http://localhost/api/messages", {
        method: "PATCH",
        headers: { Authorization: "Bearer jwt", "Content-Type": "application/json" },
        body: JSON.stringify({ id: "msg-1" }),
      })
    );
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/messages", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without auth", async () => {
    const res = await DELETE(
      new Request("http://localhost/api/messages", { method: "DELETE" })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when id is missing", async () => {
    const res = await DELETE(
      new Request("http://localhost/api/messages", {
        method: "DELETE",
        headers: { Authorization: "Bearer jwt" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("deletes message", async () => {
    const res = await DELETE(
      new Request("http://localhost/api/messages?id=msg-1", {
        method: "DELETE",
        headers: { Authorization: "Bearer jwt" },
      })
    );
    expect(res.status).toBe(200);
  });
});
