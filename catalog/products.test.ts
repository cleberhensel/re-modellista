import { describe, expect, it } from "vitest";
import { getProduct, listProducts } from "./products.js";

describe("catalog/products", () => {
  it("lists all products", () => {
    const products = listProducts();
    expect(products.length).toBeGreaterThanOrEqual(10);
    expect(products.every((p) => p.label.length > 0)).toBe(true);
  });

  it("gets blusa product", () => {
    const p = getProduct("blusa");
    expect(p?.implemented).toBe(true);
    expect(p?.measureKeys).toContain("bust");
  });

  it("returns undefined for unknown", () => {
    expect(getProduct("unknown")).toBeUndefined();
  });
});
