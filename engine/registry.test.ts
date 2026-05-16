import { describe, expect, it } from "vitest";
import {
  draftProduct,
  listRegisteredProducts,
  registerProduct,
} from "./registry.js";
import { draftBlouse } from "./products/blouse.js";

const measurements = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

describe("registry", () => {
  it("lists blusa product", () => {
    expect(listRegisteredProducts()).toContain("blusa");
  });

  it("drafts blusa via registry", () => {
    const result = draftProduct("blusa", measurements);
    expect(result.productId).toBe("blusa");
    expect(result.pieces).toHaveLength(2);
  });

  it("throws for unknown product", () => {
    expect(() => draftProduct("unknown", measurements)).toThrow(
      "unknown_product:unknown"
    );
  });

  it("allows registering products", () => {
    registerProduct("test-blouse", draftBlouse);
    const result = draftProduct("test-blouse", measurements);
    expect(result.pieces).toHaveLength(2);
  });
});
