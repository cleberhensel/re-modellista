import { describe, expect, it } from "vitest";
import { DEFAULT_MARGIN_CM, DEFAULT_PX_PER_CM } from "./constants.js";
import { buildContext } from "./context.js";
import type { Measurements } from "./types.js";

const measurements: Measurements = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

describe("buildContext", () => {
  it("builds context with defaults", () => {
    const ctx = buildContext(measurements);
    expect(ctx.k).toBe(DEFAULT_PX_PER_CM);
    expect(ctx.margin).toBe(DEFAULT_MARGIN_CM);
    expect(ctx.startOne).toBe(DEFAULT_MARGIN_CM + DEFAULT_PX_PER_CM);
    expect(ctx.startTwo).toBe(DEFAULT_MARGIN_CM);
    expect(ctx.start).toBe(ctx.startOne);
    expect(ctx.widthPx).toBe(Math.ceil((Math.floor(92) / 4) * DEFAULT_PX_PER_CM));
    expect(ctx.heightPx).toBe(Math.ceil(Math.floor(45) * DEFAULT_PX_PER_CM));
    expect(ctx.hipPx).toBe((Math.floor(81) / 4) * DEFAULT_PX_PER_CM);
    expect(ctx.formulas.shoulderY).toBe(ctx.s.two + ctx.startOne);
    expect(ctx.formulas.armholeLineY).toBe(
      ctx.s.one * 3 + ctx.s.two + ctx.startOne
    );
  });

  it("accepts custom scale options", () => {
    const ctx = buildContext(measurements, {
      pxPerCm: 10,
      marginCm: 5,
    });
    expect(ctx.k).toBe(10);
    expect(ctx.margin).toBe(5);
    expect(ctx.seventh.one).toBe(6);
    expect(ctx.widthPx).toBe(Math.ceil((Math.floor(92) / 4) * 10));
  });
});
