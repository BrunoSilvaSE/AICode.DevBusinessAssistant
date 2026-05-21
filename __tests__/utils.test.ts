import { describe, it, expect } from "vitest";
import { calculateSkills } from "../lib/utils";

describe("calculateSkills", () => {
  it("aggregates languages from repos correctly", () => {
    const repos = [
      { language: "TypeScript" },
      { language: "TypeScript" },
      { language: "Python" },
      { language: null },
      { language: "TypeScript" },
    ];
    const skills = calculateSkills(repos as any);
    expect(skills).toEqual([
      { name: "TypeScript", count: 3 },
      { name: "Python", count: 1 },
    ]);
  });

  it("returns empty array for no repos", () => {
    const skills = calculateSkills([]);
    expect(skills).toEqual([]);
  });
});
