import { describe, expect, it } from "vitest";
import { DEFAULT_PX_PER_CM } from "../engine/constants.js";
import {
  computeGridIntervals,
  renderPreviewGrid,
} from "./preview-grid.js";

describe("preview-grid", () => {
  it("uses 1 cm minor lines at normal zoom", () => {
    const g = computeGridIntervals(DEFAULT_PX_PER_CM, 1);
    expect(g.minorCm).toBe(1);
    expect(g.majorCm).toBe(10);
  });

  it("coarsens minor lines when zoomed out", () => {
    const g = computeGridIntervals(DEFAULT_PX_PER_CM, 0.4);
    expect(g.minorCm).toBe(5);
  });

  it("hides minor lines when very zoomed out", () => {
    const g = computeGridIntervals(DEFAULT_PX_PER_CM, 0.2);
    expect(g.minorCm).toBe(0);
  });

  it("renders grid in pattern coordinates", () => {
    const svg = renderPreviewGrid(
      { minX: 0, minY: 0, maxX: 200, maxY: 300 },
      DEFAULT_PX_PER_CM,
      1
    );
    expect(svg).toContain('class="preview-grid"');
    expect(svg).toContain('stroke="#a1a1aa"');
    expect(svg).toContain("28.35");
  });
});
