import { describe, expect, it } from "vitest";
import { buildContext, computeBounds, draft } from "./index.js";
import type { Measurements, PathSegment } from "./types.js";

const measurements: Measurements = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

describe("draft", () => {
  it("drafts blouse front by default", () => {
    const result = draft(measurements);
    expect(result.pieces).toHaveLength(1);
    expect(result.pieces[0].id).toBe("blouse-front");
    expect(result.pieces[0].paths.length).toBeGreaterThan(0);
    expect(result.bounds.width).toBeGreaterThan(0);
    expect(result.bounds.height).toBeGreaterThan(0);
  });

  it("drafts back placeholder", () => {
    const result = draft(measurements, { piece: "back" });
    expect(result.pieces[0]).toEqual({
      id: "blouse-back",
      paths: [],
      note: "not_implemented",
    });
  });
});

describe("computeBounds", () => {
  it("expands bounds from all segment point types", () => {
    const ctx = buildContext(measurements);
    const paths: PathSegment[] = [
      { type: "move", to: { x: 5000, y: 5000 } },
      {
        type: "line",
        from: { x: 0, y: 0 },
        to: { x: 10, y: 10 },
      },
      {
        type: "cubic",
        from: { x: 1, y: 1 },
        cp1: { x: 2, y: 2 },
        cp2: { x: 3, y: 3 },
        to: { x: 4, y: 4 },
      },
    ];
    const bounds = computeBounds([{ id: "test", paths }], ctx);
    expect(bounds.width).toBe(5000);
    expect(bounds.height).toBe(5000);
  });

  it("uses context defaults when paths are empty", () => {
    const ctx = buildContext(measurements);
    const bounds = computeBounds([{ id: "empty", paths: [] }], ctx);
    expect(bounds.width).toBe(
      Math.ceil(ctx.widthPx + ctx.start + ctx.k + 80)
    );
    expect(bounds.height).toBe(Math.ceil(ctx.heightPx + ctx.start + 80));
  });
});
