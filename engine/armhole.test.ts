import { describe, expect, it } from "vitest";
import { armholePathSegments, computeArmholePoints } from "./armhole.js";
import { buildContext } from "./context.js";
import type { Measurements } from "./types.js";

const measurements: Measurements = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

describe("armhole", () => {
  it("computes armhole points and path segments", () => {
    const ctx = buildContext(measurements);
    const intersectionY = ctx.formulas.shoulderY + 20;
    const ah = computeArmholePoints(ctx, intersectionY);
    expect(ah.p1.y).toBe(intersectionY);
    expect(ah.p4.x).toBe(ctx.widthPx + ctx.startOne + ctx.k);
    const segments = armholePathSegments(ah);
    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("line");
    expect(segments[1].type).toBe("cubic");
    expect(segments[2].type).toBe("cubic");
  });
});
