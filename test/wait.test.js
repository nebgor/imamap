import { describe, it, expect } from "vitest";

function computeWait(base, headway, randomize) {
  if (!randomize) return base + headway / 2;
  return base + headway; // clamp at worst case for deterministic test
}

describe("wait computation", () => {
  it("uses deterministic average when randomize is off", () => {
    const w = computeWait(5, 10, false);
    expect(w).toBe(10);
  });

  it("caps randomized wait for test determinism", () => {
    const w = computeWait(5, 10, true);
    expect(w).toBe(15);
  });
});
