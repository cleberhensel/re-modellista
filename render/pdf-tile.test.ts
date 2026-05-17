import { describe, expect, it } from "vitest";
import {
  A4_HEIGHT_PT,
  A4_WIDTH_PT,
  cmToPt,
  computeTilePlan,
  fitsSingleA4Sheet,
  mmToPt,
  pickA4Orientation,
  printableArea,
  TEST_SQUARE_CM,
  tileLabel,
} from "./pdf-tile.js";

describe("pdf-tile", () => {
  it("uses real-scale pt per cm", () => {
    expect(cmToPt(TEST_SQUARE_CM)).toBeCloseTo(TEST_SQUARE_CM * 28.347, 1);
  });

  it("A4 printable area excludes margins", () => {
    const m = mmToPt(12);
    const area = printableArea(A4_WIDTH_PT, A4_HEIGHT_PT, m);
    expect(area.width).toBeLessThan(A4_WIDTH_PT);
    expect(area.height).toBeLessThan(A4_HEIGHT_PT);
  });

  it("labels tiles in row/column sewing pattern style", () => {
    expect(tileLabel(0, 0)).toBe("A1");
    expect(tileLabel(2, 1)).toBe("B3");
  });

  it("plans multiple tiles for large bounds", () => {
    const margin = mmToPt(12);
    const { width, height } = printableArea(A4_WIDTH_PT, A4_HEIGHT_PT, margin);
    const plan = computeTilePlan({
      bounds: {
        minX: 0,
        minY: 0,
        maxX: width * 2.5,
        maxY: height * 2,
        width: width * 2.5,
        height: height * 2,
      },
      marginPt: margin,
    });
    expect(plan.cols).toBeGreaterThan(1);
    expect(plan.rows).toBeGreaterThan(1);
    expect(plan.tiles.length).toBe(plan.cols * plan.rows);
  });

  it("plans single tile for small bounds", () => {
    const margin = mmToPt(12);
    const { width, height } = printableArea(A4_WIDTH_PT, A4_HEIGHT_PT, margin);
    const plan = computeTilePlan({
      bounds: {
        minX: 10,
        minY: 20,
        maxX: 10 + width * 0.5,
        maxY: 20 + height * 0.5,
        width: width * 0.5,
        height: height * 0.5,
      },
      marginPt: margin,
    });
    expect(plan.tiles).toHaveLength(1);
    expect(plan.tiles[0]!.originX).toBe(10);
    expect(plan.tiles[0]!.originY).toBe(20);
  });

  it("detects single A4 fit", () => {
    const margin = mmToPt(12);
    const { width, height } = printableArea(A4_WIDTH_PT, A4_HEIGHT_PT, margin);
    expect(
      fitsSingleA4Sheet({
        minX: 0,
        minY: 0,
        maxX: width * 0.8,
        maxY: height * 0.8,
        width: width * 0.8,
        height: height * 0.8,
      })
    ).toBe(true);
  });

  it("picks landscape when piece is wide", () => {
    const o = pickA4Orientation({
      minX: 0,
      minY: 0,
      maxX: 700,
      maxY: 200,
      width: 700,
      height: 200,
    });
    expect(o).toBe("landscape");
  });
});
