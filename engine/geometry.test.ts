import { describe, expect, it } from "vitest";
import {
  add,
  cubicSegment,
  lineIntersection,
  lineSegment,
  moveTo,
  point,
} from "./geometry.js";

describe("geometry", () => {
  it("creates and adds points", () => {
    const a = point(1, 2);
    const b = point(3, 4);
    expect(add(a, b)).toEqual({ x: 4, y: 6 });
  });

  it("finds line intersection", () => {
    const hit = lineIntersection(
      point(0, 0),
      point(10, 10),
      point(0, 10),
      point(10, 0)
    );
    expect(hit).toEqual({ x: 5, y: 5 });
  });

  it("returns null for parallel lines", () => {
    const hit = lineIntersection(
      point(0, 0),
      point(10, 0),
      point(0, 5),
      point(10, 5)
    );
    expect(hit).toBeNull();
  });

  it("builds path segments", () => {
    const from = point(0, 0);
    const to = point(1, 1);
    expect(moveTo(to)).toEqual({ type: "move", to });
    expect(lineSegment(from, to)).toEqual({
      type: "line",
      from,
      to,
      dash: false,
    });
    expect(lineSegment(from, to, true)).toEqual({
      type: "line",
      from,
      to,
      dash: true,
    });
    const cp1 = point(2, 2);
    const cp2 = point(3, 3);
    expect(cubicSegment(from, cp1, cp2, to)).toEqual({
      type: "cubic",
      from,
      cp1,
      cp2,
      to,
    });
  });
});
