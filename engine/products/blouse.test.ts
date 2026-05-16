import { describe, expect, it } from "vitest";
import { draftBlouse } from "./blouse.js";

const measurements = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

describe("draftBlouse", () => {
  it("returns front and back pieces", () => {
    const result = draftBlouse(measurements);
    expect(result.productId).toBe("blusa");
    expect(result.pieces).toHaveLength(2);
    expect(result.pieces.map((p) => p.id)).toEqual([
      "blouse-front",
      "blouse-back",
    ]);
  });
});
