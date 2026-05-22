import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockDelete = vi.fn().mockResolvedValue({ error: null });
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createAuthedServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      delete: vi.fn(() => ({ eq: vi.fn(() => ({ eq: mockDelete })) })),
    })),
  })),
}));

import { GET, POST, DELETE } from "../app/api/timeline/route";

describe("GET /api/timeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
  });

  it("returns 401 without auth header", async () => {
    const req = new Request("http://localhost/api/timeline");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns timeline items for authenticated user", async () => {
    const req = new Request("http://localhost/api/timeline", {
      headers: { Authorization: "Bearer valid_jwt" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe("POST /api/timeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it("returns 401 without auth header", async () => {
    const req = new Request("http://localhost/api/timeline", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when required fields are missing", async () => {
    const req = new Request("http://localhost/api/timeline", {
      method: "POST",
      headers: { Authorization: "Bearer valid_jwt", "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Só o título" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("creates a timeline item and returns 201", async () => {
    const req = new Request("http://localhost/api/timeline", {
      method: "POST",
      headers: { Authorization: "Bearer valid_jwt", "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "work",
        title: "Dev Senior",
        institution: "Acme Corp",
        start_date: "2023-01-01",
        current: true,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

describe("DELETE /api/timeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDelete.mockResolvedValue({ error: null });
  });

  it("returns 401 without auth header", async () => {
    const req = new Request("http://localhost/api/timeline?id=abc", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when id is missing", async () => {
    const req = new Request("http://localhost/api/timeline", {
      method: "DELETE",
      headers: { Authorization: "Bearer valid_jwt" },
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it("deletes item and returns 200", async () => {
    const req = new Request("http://localhost/api/timeline?id=item-123", {
      method: "DELETE",
      headers: { Authorization: "Bearer valid_jwt" },
    });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
  });
});
