import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "profiles") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { user_id: "recipient-123" },
                error: null,
              }),
            })),
          })),
        };
      }
      // contact_messages
      return {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    }),
  })),
}));

import { POST } from "../app/api/contact/[username]/route";

function makeParams(username: string): Promise<{ username: string }> {
  return Promise.resolve({ username });
}

describe("POST /api/contact/[username]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when body is missing required fields", async () => {
    const res = await POST(
      new Request("http://localhost/api/contact/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
      { params: makeParams("user") }
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when message is empty", async () => {
    const res = await POST(
      new Request("http://localhost/api/contact/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_name: "João", sender_contact: "joao@test.com", message: "" }),
      }),
      { params: makeParams("user") }
    );
    expect(res.status).toBe(400);
  });

  it("inserts message and returns 200", async () => {
    const res = await POST(
      new Request("http://localhost/api/contact/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_name: "João Silva",
          sender_contact: "joao@example.com",
          message: "Olá, gostaria de colaborar!",
        }),
      }),
      { params: makeParams("user") }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
