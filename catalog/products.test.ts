import { describe, expect, it } from "vitest";
import {
  CATALOG_KIND_LABELS,
  getProduct,
  listCatalogGroups,
  listProducts,
} from "./products.js";

describe("catalog/products", () => {
  it("lists all products", () => {
    const products = listProducts();
    expect(products.length).toBeGreaterThanOrEqual(10);
    expect(products.every((p) => p.label.length > 0)).toBe(true);
    expect(products.every((p) => p.kind === "garment" || p.kind === "part")).toBe(
      true
    );
  });

  it("groups garments and parts for the picker", () => {
    const groups = listCatalogGroups();
    expect(groups).toHaveLength(2);
    expect(groups[0].label).toBe(CATALOG_KIND_LABELS.garment);
    expect(groups[1].label).toBe(CATALOG_KIND_LABELS.part);
    expect(groups[0].products.some((p) => p.id === "camisa")).toBe(true);
    expect(groups[1].products.some((p) => p.id === "manga")).toBe(true);
    expect(groups[0].products.every((p) => p.kind === "garment")).toBe(true);
    expect(groups[1].products.every((p) => p.kind === "part")).toBe(true);
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
