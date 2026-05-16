import { describe, expect, it } from "vitest";
import { draft } from "../engine/index.js";
import { layoutPieces, pieceBounds } from "./layout.js";
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

  it("offsets shirt pieces in a row", () => {
    const result = draft(m, { productId: "camisa" });
    const { pieces, bounds } = layoutPieces(result.pieces);
    expect(pieces.length).toBe(3);
    expect(bounds.width).toBeGreaterThan(800);
    const xs = pieces.map((p) => pieceBounds(p).minX);
    expect(new Set(xs).size).toBe(3);
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
