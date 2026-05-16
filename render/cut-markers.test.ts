import { describe, expect, it } from "vitest";
import { lineSegment, point } from "../engine/geometry.js";
import {
  cutMarkerSamples,
  cutMarkersSvg,
  scissorsIconMarkup,
} from "./cut-markers.js";
import { seamAllowanceSegments } from "./seam-allowance.js";

describe("cutMarkerSamples", () => {
  it("places few markers along a long open edge", () => {
    const seam = seamAllowanceSegments(
      [lineSegment(point(0, 0), point(400, 0))],
      1
    );
    const samples = cutMarkerSamples(seam, 200);
    expect(samples.length).toBeGreaterThan(0);
    expect(samples.length).toBeLessThanOrEqual(4);
  });

  it("samples disjoint segment groups separately", () => {
    const seam = [
      { type: "move" as const, to: point(0, 0) },
      { type: "line" as const, from: point(0, 0), to: point(100, 0), dash: true },
      { type: "line" as const, from: point(120, 0), to: point(320, 0), dash: true },
    ];
    const samples = cutMarkerSamples(seam);
    expect(samples.length).toBeGreaterThan(0);
  });

  it("starts chain from line when move is omitted", () => {
    const seam = [
      { type: "line" as const, from: point(0, 0), to: point(280, 0), dash: true },
    ];
    expect(cutMarkerSamples(seam).length).toBeGreaterThan(0);
  });

  it("returns empty for short chains", () => {
    const seam = seamAllowanceSegments(
      [lineSegment(point(0, 0), point(10, 0))],
      1
    );
    expect(cutMarkerSamples(seam)).toEqual([]);
  });
});

describe("cutMarkersSvg", () => {
  it("renders scissors groups on seam allowance", () => {
    const seam = seamAllowanceSegments(
      [
        lineSegment(point(0, 0), point(100, 0)),
        lineSegment(point(100, 0), point(100, 100)),
        lineSegment(point(100, 100), point(0, 100)),
        lineSegment(point(0, 100), point(0, 0)),
      ],
      1
    );
    const svg = cutMarkersSvg(seam, true, 200);
    expect(svg).toContain('class="cut-marker"');
    expect(svg).toContain("rotate(");
  });

  it("renders icon markup with transform", () => {
    const icon = scissorsIconMarkup({ x: 12, y: 34, angleDeg: 90 }, false);
    expect(icon).toContain("translate(12.00,34.00)");
    expect(icon).toContain("rotate(90.00)");
  });
});
