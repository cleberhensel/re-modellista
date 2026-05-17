import { describe, expect, it } from "vitest";
import type { EditablePath } from "../types.js";
import {
  pointOnHemEdge,
  resolveCfGuide,
  resolveDartFeet,
} from "./cut-geometry.js";

describe("cut-geometry", () => {
  it("keeps cf guide on bound neck and hem nodes", () => {
    const neck = { x: 12, y: 20 };
    const hem = { x: 10, y: 100 };
    const axis = resolveCfGuide(neck, hem);
    expect(axis.cf_neck).toEqual(neck);
    expect(axis.cf_hem).toEqual(hem);
  });

  it("places dart feet on slanted hem edge", () => {
    const hemA = { x: 10, y: 100 };
    const hemB = { x: 90, y: 110 };
    const feet = resolveDartFeet(hemA, hemB, 50, 5);
    expect(feet.center.y).toBeCloseTo(105, 0);
    expect(feet.plus.y).toBeCloseTo(105.56, 0);
    expect(feet.minus.y).toBeCloseTo(104.44, 0);
  });

  it("interpolates foot x along hem", () => {
    const p = pointOnHemEdge({ x: 0, y: 10 }, { x: 100, y: 10 }, 25);
    expect(p.x).toBe(25);
    expect(p.y).toBe(10);
  });
});
