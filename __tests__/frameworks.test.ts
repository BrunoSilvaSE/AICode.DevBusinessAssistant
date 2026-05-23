import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function base64(str: string) {
  return Buffer.from(str).toString("base64");
}

function makeFileResponse(content: string) {
  return {
    ok: true,
    json: () => Promise.resolve({ content: base64(content), encoding: "base64" }),
  };
}

function notFound() {
  return { ok: false };
}

function routeByUrl(routes: Record<string, ReturnType<typeof makeFileResponse | typeof notFound>>) {
  return (url: unknown) => {
    const urlStr = String(url);
    for (const [key, val] of Object.entries(routes)) {
      if (urlStr.includes(key)) return Promise.resolve(val);
    }
    return Promise.resolve(notFound());
  };
}

import { detectFrameworks } from "../lib/frameworks";

const TOKEN = "fake-token";

describe("detectFrameworks", () => {
  beforeEach(() => mockFetch.mockReset());

  it("detects React and Next.js from package.json", async () => {
    const pkg = JSON.stringify({
      dependencies: { react: "^18.0.0", next: "^14.0.0", zod: "^3.0.0" },
    });
    mockFetch.mockImplementation(routeByUrl({
      "Dockerfile": notFound(),
      "package.json": makeFileResponse(pkg),
    }));
    const repos = [{ name: "my-app", full_name: "user/my-app", language: "TypeScript" }];
    const result = await detectFrameworks(repos, TOKEN);
    expect(result["React"]).toBe(1);
    expect(result["Next.js"]).toBe(1);
    expect(result["Zod"]).toBe(1);
  });

  it("detects FastAPI and Pydantic from requirements.txt", async () => {
    const reqs = "fastapi==0.110.0\npydantic>=2.0\nuvicorn[standard]\n";
    mockFetch.mockImplementation(routeByUrl({
      "Dockerfile": notFound(),
      "requirements.txt": makeFileResponse(reqs),
    }));
    const repos = [{ name: "api", full_name: "user/api", language: "Python" }];
    const result = await detectFrameworks(repos, TOKEN);
    expect(result["FastAPI"]).toBe(1);
    expect(result["Pydantic"]).toBe(1);
    expect(result["Uvicorn"]).toBe(1);
  });

  it("detects Docker when Dockerfile is present", async () => {
    const dockerfile = "FROM node:20-alpine\nWORKDIR /app\n";
    mockFetch.mockImplementation(routeByUrl({
      "Dockerfile": makeFileResponse(dockerfile),
    }));
    const repos = [{ name: "service", full_name: "user/service", language: "TypeScript" }];
    const result = await detectFrameworks(repos, TOKEN);
    expect(result["Docker"]).toBe(1);
  });

  it("counts frameworks across multiple repos", async () => {
    const pkg = JSON.stringify({ dependencies: { react: "^18.0.0" } });
    mockFetch.mockImplementation(routeByUrl({
      "Dockerfile": notFound(),
      "package.json": makeFileResponse(pkg),
    }));
    const repos = [
      { name: "app1", full_name: "user/app1", language: "TypeScript" },
      { name: "app2", full_name: "user/app2", language: "JavaScript" },
    ];
    const result = await detectFrameworks(repos, TOKEN);
    expect(result["React"]).toBe(2);
  });

  it("returns empty object when no dependency files found", async () => {
    mockFetch.mockImplementation(() => Promise.resolve(notFound()));
    const repos = [{ name: "simple", full_name: "user/simple", language: "Go" }];
    const result = await detectFrameworks(repos, TOKEN);
    expect(Object.keys(result).length).toBe(0);
  });
});
