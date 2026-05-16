import { afterEach, describe, expect, it, vi } from "vitest";
import * as geometry from "../geometry.js";
import { buildContext } from "../context.js";
import { draftBlouseFront } from "./blouse-front.js";
import type { Measurements } from "../types.js";

const measurements: Measurements = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("draftBlouseFront", () => {
  it("drafts a complete front piece with grainline", () => {
    const ctx = buildContext(measurements);
    const piece = draftBlouseFront(ctx);
    expect(piece.error).toBeUndefined();
    expect(piece.paths.length).toBeGreaterThanOrEqual(10);
    expect(piece.points?.grainHit).toBeDefined();
    expect(piece.points?.dartCenterX).toBe((ctx.hipPx + ctx.startOne) / 2);
  });

  it("returns error when shoulder lines do not intersect", () => {
    vi.spyOn(geometry, "lineIntersection").mockReturnValue(null);
    const ctx = buildContext(measurements);
    const piece = draftBlouseFront(ctx);
    expect(piece.error).toBe("shoulder_virtual_no_intersection");
    expect(piece.paths).toEqual([]);
  });

  it("omits grainline when grain intersection is missing", () => {
    const ctx = buildContext(measurements);
    const shoulderHit = geometry.lineIntersection(
      { x: ctx.s.one + ctx.startOne, y: ctx.startOne },
      { x: ctx.widthPx + ctx.startOne, y: ctx.s.two + ctx.startOne },
      {
        x: ctx.widthPx - ctx.s.two - ctx.s.four / 2 + ctx.startOne,
        y: ctx.startOne,
      },
      {
        x: ctx.widthPx - ctx.s.two - ctx.s.four / 2 + ctx.startOne,
        y: ctx.s.one * 3 + ctx.s.two - ctx.s.four + ctx.startOne,
      }
    );
    vi.spyOn(geometry, "lineIntersection")
      .mockReturnValueOnce(shoulderHit)
      .mockReturnValueOnce(null);
    const piece = draftBlouseFront(ctx);
    expect(piece.error).toBeUndefined();
    expect(piece.points?.grainHit).toBeNull();
    const hasGrainSegment = piece.paths.some(
      (seg) =>
        seg.type === "line" &&
        seg.from === shoulderHit &&
        seg.to.x === ctx.widthPx / 2 + ctx.startOne
    );
    expect(hasGrainSegment).toBe(false);
  });
});
