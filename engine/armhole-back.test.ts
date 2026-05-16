import { describe, expect, it } from "vitest";
import { buildContext } from "./context.js";
import {
  armholeBackPathSegments,
  computeArmholeBackPoints,
} from "./armhole-back.js";

const measurements = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

describe("armholeBack", () => {
  it("builds back armhole segments", () => {
    const ctx = buildContext(measurements);
    const ah = computeArmholeBackPoints(ctx, ctx.startOne + ctx.s.two + 50);
    const segments = armholeBackPathSegments(ah);
    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("line");
    expect(segments[1].type).toBe("cubic");
    expect(segments[2].type).toBe("cubic");
  });

  it("places p2 below p1 and p3 below p2 on vertical guide", () => {
    const ctx = buildContext(measurements);
    const y = 200;
    const ah = computeArmholeBackPoints(ctx, y);
    expect(ah.p1.y).toBe(y);
    expect(ah.p2.x).toBe(ah.p1.x);
    expect(ah.p2.y).toBeGreaterThan(ah.p1.y);
    expect(ah.p3.y).toBeGreaterThan(ah.p2.y);
    expect(ah.p3.x).toBeGreaterThan(ah.p2.x);
  });
});
