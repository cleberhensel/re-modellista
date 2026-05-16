import { describe, expect, it } from "vitest";
import { lineSegment } from "../geometry.js";
import { pathLength } from "./pathLength.js";

describe("pathLength", () => {
  it("sums line segments", () => {
    const len = pathLength([
      lineSegment({ x: 0, y: 0 }, { x: 3, y: 4 }),
      lineSegment({ x: 3, y: 4 }, { x: 3, y: 9 }),
    ]);
    expect(len).toBeCloseTo(10, 5);
  });
});
