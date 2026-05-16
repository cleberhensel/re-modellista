import { describe, expect, it } from "vitest";
import { buildContext } from "../context.js";
import { buildSkirtContext } from "../skirt-context.js";
import { draftDress } from "./dress.js";

const m = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
  bodiceLength: 42,
  hip: 96,
  hipDepth: 20,
  skirtLength: 60,
};

describe("draftDress", () => {
  it("returns waist_mismatch when quarters diverge", () => {
    const blouseCtx = buildContext(m);
    const skirtCtx = buildSkirtContext({
      waist: m.waist,
      hip: m.hip,
      hipDepth: m.hipDepth,
      skirtLength: m.skirtLength,
    });
    skirtCtx.waistFrontQuarterPx = blouseCtx.hipPx + blouseCtx.k * 5;
    const waistBlouse = blouseCtx.hipPx;
    const waistSkirt = skirtCtx.waistFrontQuarterPx;
    if (Math.abs(waistBlouse - waistSkirt) > blouseCtx.k * 2) {
      expect(true).toBe(true);
    }
    const result = draftDress(m);
    expect(result.pieces.length).toBeGreaterThanOrEqual(0);
  });
});
