import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createBrowserClient: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue(
            table === "profiles"
              ? { data: { username: "devuser", full_name: "Dev", skills: [], user_id: "uid-1" }, error: null }
              : { data: null, error: null }
          ),
          order: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
      })),
    })),
  })),
}));

import { GET } from "../app/api/u/[username]/route";

describe("GET /api/u/[username]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when profile not found", async () => {
    const { createBrowserClient } = await import("@/lib/supabase/client");
    vi.mocked(createBrowserClient).mockReturnValueOnce({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
          })),
        })),
      })),
    } as never);

    const req = new Request("http://localhost/api/u/unknown");
    const res = await GET(req, { params: Promise.resolve({ username: "unknown" }) });
    expect(res.status).toBe(404);
  });

  it("returns profile and posts on success", async () => {
    const req = new Request("http://localhost/api/u/devuser");
    const res = await GET(req, { params: Promise.resolve({ username: "devuser" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("profile");
    expect(data).toHaveProperty("posts");
  });
});
