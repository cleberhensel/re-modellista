import { describe, expect, it } from "vitest";
import { lineSegment, point } from "../../engine/geometry.js";
import { parseDartFromDashed } from "./dart-geometry.js";

describe("parseDartFromDashed", () => {
  it("reads spread from dart legs not shoulder line", () => {
    const apex = point(50, 40);
    const hemY = 100;
    const spread = 4;
    const paths = [
      lineSegment(point(10, 10), point(10, hemY), true),
      lineSegment(point(10, 10), point(200, 12), true),
      lineSegment(apex, point(50, hemY), true),
      lineSegment(apex, point(50 + spread, hemY), true),
      lineSegment(apex, point(50 - spread, hemY), true),
    ];
    const parsed = parseDartFromDashed(paths);
    expect(parsed?.spread).toBeCloseTo(spread, 1);
    expect(parsed?.apex.x).toBeCloseTo(50, 1);
  });
});
