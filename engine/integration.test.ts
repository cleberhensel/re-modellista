import { describe, expect, it } from "vitest";
import { draftProduct, listRegisteredProducts } from "./registry.js";
import { applyFabricProfile, getFabricProfile } from "./fabric.js";
import { computeSleeveGrid } from "./sleeve-grid.js";
import { applySleeveHandles, addSleeveHandle } from "./sleeve-handles.js";
import { buildContext } from "./context.js";
import { buildSkirtContext } from "./skirt-context.js";
import { buildPantContext } from "./pant-context.js";
import { computeBounds } from "./bounds.js";
import { pathLength } from "./geometry/pathLength.js";
import { getGuardrails, resolveMeasurements } from "./guardrails/index.js";
import { isBlouseBackStable, shoulderBackIntersects } from "./guardrails/checks.js";
import {
  defaultBodiceMeasurements,
  goldenBlouseFrontDartCenterX,
} from "./fixtures/blouse-golden.js";
import type { Measurements } from "./types.js";
import { point } from "./geometry.js";

const bodice: Measurements = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

describe("integration", () => {
  it("registers all products", () => {
    expect(listRegisteredProducts().length).toBeGreaterThanOrEqual(14);
  });

  for (const id of [
    "blusa",
    "manga",
    "camisa",
    "saia-reta",
    "calca",
    "bermuda",
    "vestido",
    "top-sem-mangas",
    "punho",
    "colarinho",
    "cos",
    "bolso-peito",
    "carcela",
    "malha",
    "casaco",
  ]) {
    it(`drafts ${id}`, () => {
      const m: Measurements = {
        ...bodice,
        hip: 96,
        hipDepth: 20,
        skirtLength: 60,
        crotchDepth: 26,
        inseam: 78,
        bodiceLength: 42,
        designEaseBust: 6,
        coatLength: 65,
      };
      const result = draftProduct(id, m);
      expect(result.productId).toBe(id);
      expect(result.bounds.width).toBeGreaterThan(0);
    });
  }

  it("drafts saia-reta with optional waistband", () => {
    const result = draftProduct(
      "saia-reta",
      { waist: 70, hip: 96, hipDepth: 20, skirtLength: 60 },
      { includeWaistband: true }
    );
    expect(result.pieces.length).toBe(3);
  });

  it("drafts vestido with four pieces", () => {
    const result = draftProduct("vestido", {
      ...bodice,
      bodiceLength: 42,
      hip: 96,
      hipDepth: 20,
      skirtLength: 60,
    });
    expect(result.pieces).toHaveLength(4);
  });

  it("covers fabric profiles", () => {
    const profile = getFabricProfile("knit-strong");
    const adjusted = applyFabricProfile(bodice, profile);
    expect(adjusted.bust).toBeLessThan(bodice.bust);
  });

  it("covers sleeve grid and handles", () => {
    const ctx = buildContext(bodice);
    const grid = computeSleeveGrid(ctx, 200);
    expect(grid.p1.x).toBeDefined();
    const verts = [
      { point: grid.p1, handleIn: point(0, 0), handleOut: point(0, 0) },
      { point: grid.p2, handleIn: point(0, 0), handleOut: point(0, 0) },
      { point: grid.p3, handleIn: point(0, 0), handleOut: point(0, 0) },
      { point: grid.p4, handleIn: point(0, 0), handleOut: point(0, 0) },
      { point: grid.p5, handleIn: point(0, 0), handleOut: point(0, 0) },
      { point: grid.p6, handleIn: point(0, 0), handleOut: point(0, 0) },
      { point: grid.p7, handleIn: point(0, 0), handleOut: point(0, 0) },
      { point: grid.p8, handleIn: point(0, 0), handleOut: point(0, 0) },
    ];
    const handled = applySleeveHandles(verts);
    expect(handled[0].handleOut.x).toBeDefined();
    addSleeveHandle(handled, 0);
    addSleeveHandle(handled, handled.length - 1);
    const flat = [
      { point: grid.p2, handleIn: point(1, 0), handleOut: point(0, 0) },
      { point: grid.p3, handleIn: point(0, 0), handleOut: point(1, 0) },
      { point: grid.p4, handleIn: point(0, 0), handleOut: point(0, 0) },
    ];
    addSleeveHandle(flat, 1);
  });

  it("covers skirt and pant contexts bounds", () => {
    const skirt = buildSkirtContext({
      waist: 70,
      hip: 96,
      hipDepth: 20,
      skirtLength: 60,
    });
    const pant = buildPantContext({
      waist: 70,
      hip: 96,
      crotchDepth: 26,
      inseam: 78,
    });
    expect(computeBounds([], skirt).height).toBeGreaterThan(0);
    expect(computeBounds([], pant).height).toBeGreaterThan(0);
  });

  it("covers path length move segment", () => {
    const len = pathLength([{ type: "move", to: point(0, 0) }]);
    expect(len).toBe(0);
  });

  it("covers guardrails for all products", () => {
    for (const id of listRegisteredProducts()) {
      const g = getGuardrails(id);
      const m = resolveMeasurements(id, bodice, "bust");
      expect(m.bust).toBeDefined();
      for (const key of Object.keys(g.fields)) {
        g.getFieldRange(m, key as keyof typeof g.fields & string);
      }
    }
    expect(() => getGuardrails("unknown")).toThrow();
  });

  it("covers back shoulder check branches", () => {
    const ctx = buildContext(bodice);
    expect(shoulderBackIntersects(ctx)).toBe(true);
    expect(isBlouseBackStable(bodice)).toBe(true);
  });

  it("covers golden fixture", () => {
    expect(goldenBlouseFrontDartCenterX(defaultBodiceMeasurements)).toBeGreaterThan(
      0
    );
  });

  it("covers optional measurement defaults", () => {
    draftProduct("saia-reta", { ...bodice, waist: 70 });
    draftProduct("calca", { ...bodice, waist: 70 });
    draftProduct("vestido", { ...bodice, bodiceLength: 42 });
    draftProduct("casaco", { ...bodice, coatLength: undefined, designEaseBust: undefined });
    draftProduct("punho", bodice);
  });

  it("covers blouse unstable resolve branches", () => {
    const g = getGuardrails("blusa");
    const m = g.resolve({ ...bodice, height: 28, bust: 72 }, "height");
    expect(m.height).toBeGreaterThanOrEqual(28);
  });
});
