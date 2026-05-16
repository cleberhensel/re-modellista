import { describe, expect, it } from "vitest";
import { addSleeveHandle } from "./sleeve-handles.js";
import { point } from "./geometry.js";

describe("sleeve-handles", () => {
  it("handles flat neighbors", () => {
    const verts = [
      { point: point(0, 10), handleIn: point(0, 0), handleOut: point(0, 0) },
      { point: point(10, 10), handleIn: point(0, 0), handleOut: point(0, 0) },
      { point: point(20, 10), handleIn: point(0, 0), handleOut: point(0, 0) },
    ];
    const mid = addSleeveHandle(verts, 1);
    expect(mid.handleOut).toBeDefined();
  });

  it("handles existing neighbor handles", () => {
    const verts = [
      { point: point(0, 0), handleIn: point(0, 0), handleOut: point(2, 1) },
      { point: point(10, 5), handleIn: point(-1, 0), handleOut: point(0, 0) },
      { point: point(20, 10), handleIn: point(0, 0), handleOut: point(1, 1) },
    ];
    const mid = addSleeveHandle(verts, 1);
    expect(mid.handleIn.x).toBeDefined();
  });
});
