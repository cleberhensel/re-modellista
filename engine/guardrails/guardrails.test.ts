import { describe, expect, it, vi } from "vitest";
import { buildContext } from "../context.js";
import * as sleeveModule from "../pieces/sleeve.js";
import { blouseFrontGuardrails, isBlouseFrontStable } from "./index.js";
import { shirtGuardrails } from "./shirt.js";
import { dartClearsArmhole, shoulderIntersects } from "./checks.js";
import type { Measurements } from "../types.js";

const defaults: Measurements = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

describe("blouseFrontGuardrails", () => {
  it("keeps defaults stable", () => {
    const m = blouseFrontGuardrails.resolve(defaults, "bust");
    expect(isBlouseFrontStable(m)).toBe(true);
  });

  it("clamps waist to bust-relative band", () => {
    const m = blouseFrontGuardrails.resolve(
      { ...defaults, waist: 40 },
      "waist"
    );
    const range = blouseFrontGuardrails.getFieldRange(m, "waist");
    expect(m.waist).toBeGreaterThanOrEqual(range.min);
    expect(m.waist).toBeLessThanOrEqual(range.max);
  });

  it("raises min height when bust grows", () => {
    const small = blouseFrontGuardrails.getFieldRange(
      { ...defaults, bust: 80 },
      "height"
    );
    const large = blouseFrontGuardrails.getFieldRange(
      { ...defaults, bust: 110 },
      "height"
    );
    expect(large.min).toBeGreaterThan(small.min);
  });

  it("stabilizes extreme height after resolve", () => {
    const m = blouseFrontGuardrails.resolve(
      { ...defaults, height: 28 },
      "height"
    );
    expect(isBlouseFrontStable(m)).toBe(true);
    expect(m.height).toBeGreaterThan(28);
  });
});

describe("shirtGuardrails", () => {
  it("resolve when cap ease is unavailable", () => {
    vi.spyOn(sleeveModule, "draftSleevePiece").mockReturnValue({
      id: "sleeve",
      paths: [],
      error: "sleeve_armhole_unavailable",
    });
    const m = shirtGuardrails.resolve(defaults, "bust");
    expect(m.bust).toBe(defaults.bust);
    vi.restoreAllMocks();
  });

  it("resolve when cap ease is outside target band", () => {
    vi.spyOn(sleeveModule, "draftSleevePiece").mockReturnValue({
      id: "sleeve",
      paths: [{ type: "line", from: { x: 0, y: 0 }, to: { x: 1, y: 1 } }],
      points: { capEase: 800 },
    });
    const m = shirtGuardrails.resolve(defaults, "bust");
    expect(m.bust).toBe(defaults.bust);
    vi.restoreAllMocks();
  });
});

describe("structural checks", () => {
  it("detects shoulder intersection for default block", () => {
    const ctx = buildContext(defaults);
    expect(shoulderIntersects(ctx)).toBe(true);
    expect(dartClearsArmhole(ctx)).toBe(true);
  });
});
