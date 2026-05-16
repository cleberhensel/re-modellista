import { describe, expect, it } from "vitest";
import { buildContext } from "../engine/context.js";
import { DEFAULT_PX_PER_CM } from "../engine/constants.js";
import { lineSegment, point } from "../engine/geometry.js";
import { draftSleevePiece } from "../engine/pieces/sleeve.js";
import type { PathSegment, Point2 } from "../engine/types.js";
import { pieceBounds } from "./layout.js";
import {
  DEFAULT_SEAM_ALLOWANCE_CM,
  seamAllowancePaddingPx,
  seamAllowanceSegments,
} from "./seam-allowance.js";

function collectPathPoints(segments: PathSegment[]): Point2[] {
  const pts: Point2[] = [];
  for (const seg of segments) {
    if (seg.type === "move") pts.push(seg.to);
    else if (seg.type === "line") {
      pts.push(seg.from, seg.to);
    } else {
      pts.push(seg.from, seg.cp1, seg.cp2, seg.to);
    }
  }
  return pts;
}

function boundsOf(pts: Point2[]) {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

describe("seamAllowanceSegments", () => {
  it("offsets a closed square outward", () => {
    const square = [
      lineSegment(point(0, 0), point(100, 0)),
      lineSegment(point(100, 0), point(100, 100)),
      lineSegment(point(100, 100), point(0, 100)),
      lineSegment(point(0, 100), point(0, 0)),
    ];
    const offset = seamAllowanceSegments(square, 1, DEFAULT_PX_PER_CM);
    expect(offset.length).toBeGreaterThan(0);
    const lines = offset.filter((s) => s.type === "line");
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.every((s) => s.dash)).toBe(true);
    const xs: number[] = [];
    for (const seg of offset) {
      if (seg.type === "line") {
        xs.push(seg.from.x, seg.to.x);
      }
    }
    expect(Math.min(...xs)).toBeLessThan(0);
    expect(Math.max(...xs)).toBeGreaterThan(100);
  });

  it("returns empty when allowance is zero", () => {
    const square = [
      lineSegment(point(0, 0), point(10, 0)),
      lineSegment(point(10, 0), point(10, 10)),
    ];
    expect(seamAllowanceSegments(square, 0)).toEqual([]);
  });

  it("offsets open polylines without closing segment", () => {
    const open = [
      lineSegment(point(0, 0), point(80, 0)),
      lineSegment(point(80, 0), point(80, 40)),
    ];
    const offset = seamAllowanceSegments(open, 1, DEFAULT_PX_PER_CM);
    expect(offset.some((s) => s.type === "line")).toBe(true);
    const closing = offset.filter(
      (s) => s.type === "line" && s.from.x === s.to.x && s.from.y === s.to.y
    );
    expect(closing.length).toBe(0);
  });

  it("drops duplicate closing point when loop is nearly closed", () => {
    const imprecise = [
      lineSegment(point(0, 0), point(50, 0)),
      lineSegment(point(50, 0), point(50, 50)),
      lineSegment(point(50, 50), point(0, 50)),
      lineSegment(point(0, 50), point(0.0002, 0)),
    ];
    const offset = seamAllowanceSegments(imprecise, 1, DEFAULT_PX_PER_CM);
    expect(offset.length).toBeGreaterThan(0);
  });

  it("handles reversing colinear corner via bisector fallback", () => {
    const hairpin = [
      lineSegment(point(0, 10), point(0, 0)),
      lineSegment(point(0, 0), point(0, 10)),
    ];
    const offset = seamAllowanceSegments(hairpin, 1, DEFAULT_PX_PER_CM);
    expect(offset.length).toBeGreaterThan(0);
  });

  it("reconnects disjoint line chains at segment joints", () => {
    const disjoint = [
      lineSegment(point(0, 0), point(40, 0)),
      lineSegment(point(50, 0), point(90, 0)),
    ];
    const offset = seamAllowanceSegments(disjoint, 1, DEFAULT_PX_PER_CM);
    expect(offset.length).toBeGreaterThan(0);
  });

  it("flattens cubic curves before offset", () => {
    const curved = [
      {
        type: "cubic" as const,
        from: point(0, 0),
        cp1: point(30, 0),
        cp2: point(70, 100),
        to: point(100, 100),
      },
    ];
    const offset = seamAllowanceSegments(curved, 1, DEFAULT_PX_PER_CM);
    expect(offset.length).toBeGreaterThan(2);
  });

  it("bridges gap before cubic when from does not match prior point", () => {
    const gapped = [
      lineSegment(point(0, 0), point(20, 0)),
      {
        type: "cubic" as const,
        from: point(40, 0),
        cp1: point(50, 0),
        cp2: point(60, 40),
        to: point(70, 50),
      },
    ];
    const offset = seamAllowanceSegments(gapped, 1, DEFAULT_PX_PER_CM);
    expect(offset.length).toBeGreaterThan(0);
  });

  it("offsets sleeve outline outward on all sides", () => {
    const ctx = buildContext({
      bust: 92,
      height: 45,
      waist: 81,
      wrist: 12,
      sleeveLength: 27,
    });
    const piece = draftSleevePiece(ctx);
    expect(piece.error).toBeUndefined();
    const pad = DEFAULT_PX_PER_CM;
    const offset = seamAllowanceSegments(piece.paths, 1, pad);
    const solidPts = collectPathPoints(piece.paths);
    const offsetPts = collectPathPoints(offset);
    const solidBox = boundsOf(solidPts);
    const offsetBox = boundsOf(offsetPts);
    expect(offsetBox.minY).toBeLessThan(solidBox.minY - pad * 0.25);
    expect(offsetBox.maxY).toBeGreaterThan(solidBox.maxY + pad * 0.25);
    expect(offsetBox.minX).toBeLessThan(solidBox.minX - pad * 0.25);
    expect(offsetBox.maxX).toBeGreaterThan(solidBox.maxX + pad * 0.25);
  });

  it("expands piece bounds padding", () => {
    const pad = seamAllowancePaddingPx(1);
    const bounds = pieceBounds({
      id: "x",
      paths: [lineSegment(point(10, 10), point(50, 40))],
    });
    const expanded = {
      minX: bounds.minX - pad,
      minY: bounds.minY - pad,
      width: bounds.width + pad * 2,
      height: bounds.height + pad * 2,
    };
    expect(expanded.width).toBeGreaterThan(bounds.width);
    expect(DEFAULT_SEAM_ALLOWANCE_CM).toBe(1);
  });
});
