import { describe, it, expect, vi, beforeEach } from "vitest";

global.fetch = vi.fn();

import { GET } from "../app/api/repos/route";

describe("GET /api/repos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when X-GitHub-Token header is missing", async () => {
    const req = new Request("http://localhost/api/repos");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns repos list when called with valid GitHub token", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            id: 1,
            name: "my-project",
            description: "cool project",
            language: "TypeScript",
            stargazers_count: 5,
            updated_at: "2026-05-01",
            html_url: "https://github.com/BrunoSilvaSE/my-project",
            owner: { login: "BrunoSilvaSE" },
          },
        ]),
        { status: 200 }
      )
    );

    const req = new Request("http://localhost/api/repos", {
      headers: { "X-GitHub-Token": "gho_fake_github_token" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("my-project");
  });

  it("returns 502 when GitHub API fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 403 }));

    const req = new Request("http://localhost/api/repos", {
      headers: { "X-GitHub-Token": "gho_bad_token" },
    });
    const res = await GET(req);
    expect(res.status).toBe(502);
  });
});
