import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createAuthedServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      }),
    },
  })),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: "https://storage.example.com/repo-covers/user-123/repo.jpg" },
        }),
      })),
    },
  })),
}));

import { POST } from "../app/api/repo-cover/route";

describe("POST /api/repo-cover", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without Authorization header", async () => {
    const res = await POST(new Request("http://localhost/api/repo-cover", { method: "POST" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when file is missing", async () => {
    const fd = new FormData();
    fd.append("repo", "user/my-repo");
    const res = await POST(
      new Request("http://localhost/api/repo-cover", {
        method: "POST",
        headers: { Authorization: "Bearer jwt" },
        body: fd,
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when repo is missing", async () => {
    const fd = new FormData();
    fd.append("file", new File(["data"], "img.jpg", { type: "image/jpeg" }));
    const res = await POST(
      new Request("http://localhost/api/repo-cover", {
        method: "POST",
        headers: { Authorization: "Bearer jwt" },
        body: fd,
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-image file type", async () => {
    const fd = new FormData();
    fd.append("repo", "user/my-repo");
    fd.append("file", new File(["content"], "doc.pdf", { type: "application/pdf" }));
    const res = await POST(
      new Request("http://localhost/api/repo-cover", {
        method: "POST",
        headers: { Authorization: "Bearer jwt" },
        body: fd,
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("imagens");
  });

  it("returns 400 for file exceeding 2MB", async () => {
    const fd = new FormData();
    fd.append("repo", "user/my-repo");
    const bigFile = new File([new Uint8Array(3 * 1024 * 1024)], "big.jpg", { type: "image/jpeg" });
    fd.append("file", bigFile);
    const res = await POST(
      new Request("http://localhost/api/repo-cover", {
        method: "POST",
        headers: { Authorization: "Bearer jwt" },
        body: fd,
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("2MB");
  });

  it("uploads image and returns public URL", async () => {
    const fd = new FormData();
    fd.append("repo", "user/my-repo");
    fd.append("file", new File(["img"], "cover.jpg", { type: "image/jpeg" }));
    const res = await POST(
      new Request("http://localhost/api/repo-cover", {
        method: "POST",
        headers: { Authorization: "Bearer jwt" },
        body: fd,
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("url");
    expect(data.url).toMatch(/^https?:\/\//);
  });
});
