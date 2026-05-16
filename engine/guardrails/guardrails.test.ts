import { describe, expect, it } from "vitest";
import { buildContext } from "../context.js";
import { blouseFrontGuardrails, isBlouseFrontStable } from "./index.js";
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

describe("structural checks", () => {
  it("detects shoulder intersection for default block", () => {
    const ctx = buildContext(defaults);
    expect(shoulderIntersects(ctx)).toBe(true);
    expect(dartClearsArmhole(ctx)).toBe(true);
  });
});
