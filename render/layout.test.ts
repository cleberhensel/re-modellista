import { describe, expect, it } from "vitest";
import { draft } from "../engine/index.js";
import { DEFAULT_PX_PER_CM } from "../engine/constants.js";
import {
  expandPieceBounds,
  layoutPieces,
  pieceBounds,
  pieceLayoutBounds,
} from "./layout.js";
import { seamAllowancePaddingPx } from "./seam-allowance.js";
import { pieceToSvgPath } from "./svg.js";

const m = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

describe("layoutPieces", () => {
  it("offsets blouse front and back horizontally", () => {
    const result = draft(m, { productId: "blusa" });
    const { pieces } = layoutPieces(result.pieces);
    const front = pieces.find((p) => p.id === "blouse-front")!;
    const back = pieces.find((p) => p.id === "blouse-back")!;
    const bf = pieceBounds(front);
    const bb = pieceBounds(back);
    expect(bb.minX).toBeGreaterThan(bf.maxX);
  });

  it("spaces pieces by cut line including seam allowance", () => {
    const pad = seamAllowancePaddingPx(1, DEFAULT_PX_PER_CM);
    const gap = 56;
    const piece = {
      id: "a",
      paths: [
        {
          type: "line" as const,
          from: { x: 0, y: 0 },
          to: { x: 100, y: 80 },
        },
      ],
    };
    const { pieces } = layoutPieces([piece, { ...piece, id: "b" }], {
      gap,
      padding: 24,
      seamAllowanceCm: 1,
    });
    const a = pieceLayoutBounds(pieces[0], 1);
    const b = pieceLayoutBounds(pieces[1], 1);
    expect(b.minX - a.maxX).toBeCloseTo(gap, 0);
    expect(a.minX).toBeCloseTo(24, 0);
  });

  it("expands bounds by seam padding", () => {
    const b = pieceBounds({
      id: "x",
      paths: [
        {
          type: "line",
          from: { x: 10, y: 10 },
          to: { x: 50, y: 40 },
        },
      ],
    });
    const pad = seamAllowancePaddingPx(1);
    const expanded = expandPieceBounds(b, pad);
    expect(expanded.minX).toBe(b.minX - pad);
    expect(expanded.width).toBe(b.width + pad * 2);
  });

  it("translates move segments in layout", () => {
    const piece = {
      id: "move-piece",
      paths: [
        { type: "move" as const, to: { x: 100, y: 50 } },
        {
          type: "line" as const,
          from: { x: 100, y: 50 },
          to: { x: 200, y: 50 },
        },
      ],
    };
    const pad = seamAllowancePaddingPx(1);
    const { pieces } = layoutPieces([piece], {
      gap: 10,
      padding: 5,
      seamAllowanceCm: 1,
    });
    const seg = pieces[0].paths[0];
    expect(seg.type).toBe("move");
    if (seg.type === "move") {
      expect(seg.to.x).toBeCloseTo(5 + pad, 0);
    }
  });

  it("preserves empty pieces and wraps wide rows", () => {
    const empty = { id: "empty", paths: [] as const };
    const wide = {
      id: "blouse-front",
      paths: [
        {
          type: "line" as const,
          from: { x: 0, y: 0 },
          to: { x: 4000, y: 500 },
        },
      ],
    };
    const { pieces } = layoutPieces([empty, wide, { ...wide, id: "blouse-back" }], {
      productId: "camisa",
      gap: 40,
      padding: 20,
    });
    expect(pieces).toHaveLength(3);
    const back = pieces.find((p) => p.id === "blouse-back")!;
    expect(pieceBounds(back).minY).toBeGreaterThan(500);
  });

  it("offsets shirt pieces in a row", () => {
    const result = draft(m, { productId: "camisa" });
    const { pieces, bounds } = layoutPieces(result.pieces, { productId: "camisa" });
    expect(pieces.length).toBe(8);
    expect(bounds.width).toBeGreaterThan(800);
    const xs = pieces.map((p) => pieceBounds(p).minX);
    expect(new Set(xs).size).toBeGreaterThanOrEqual(3);
  });
});

describe("pieceToSvgPath", () => {
  it("skips dashed construction segments", () => {
    const d = pieceToSvgPath({
      id: "t",
      paths: [
        {
          type: "line",
          from: { x: 0, y: 0 },
          to: { x: 10, y: 0 },
        },
        {
          type: "line",
          from: { x: 0, y: 5 },
          to: { x: 0, y: 10 },
          dash: true,
        },
      ],
    });
    expect(d).toContain("L 10.00 0.00");
    expect(d).not.toContain("L 0.00 10.00");
  });
});
