import { describe, expect, it } from "vitest";
import { computeBounds } from "./bounds.js";
import { buildPantContext } from "./pant-context.js";
import { buildSkirtContext } from "./skirt-context.js";

describe("computeBounds", () => {
  it("defaults for skirt context", () => {
    const ctx = buildSkirtContext({
      waist: 70,
      hip: 96,
      hipDepth: 20,
      skirtLength: 60,
    });
    const b = computeBounds([], ctx);
    expect(b.width).toBeGreaterThan(0);
  });

  it("defaults for pant context", () => {
    const ctx = buildPantContext({
      waist: 70,
      hip: 96,
      crotchDepth: 26,
      inseam: 78,
    });
    const b = computeBounds([], ctx);
    expect(b.height).toBeGreaterThan(0);
  });
});
