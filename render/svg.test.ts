import { describe, expect, it } from "vitest";
import { draft } from "../engine/index.js";
import { pieceToSvgPath, renderDraftToSvg } from "./svg.js";
import type { Measurements, PatternPiece } from "../engine/types.js";

const measurements: Measurements = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

describe("pieceToSvgPath", () => {
  it("renders move, line and cubic commands", () => {
    const piece: PatternPiece = {
      id: "segments",
      paths: [
        { type: "move", to: { x: 1, y: 2 } },
        {
          type: "line",
          from: { x: 3, y: 4 },
          to: { x: 5, y: 6 },
        },
        {
          type: "cubic",
          from: { x: 7, y: 8 },
          cp1: { x: 9, y: 10 },
          cp2: { x: 11, y: 12 },
          to: { x: 13, y: 14 },
        },
      ],
    };
    const d = pieceToSvgPath(piece);
    expect(d).toContain("M 1.00 2.00");
    expect(d).toContain("L 5.00 6.00");
    expect(d).toContain("C 9.00 10.00 11.00 12.00 13.00 14.00");
  });

  it("prepends move when line is the first segment", () => {
    const d = pieceToSvgPath({
      id: "line-first",
      paths: [
        {
          type: "line",
          from: { x: 3, y: 4 },
          to: { x: 5, y: 6 },
        },
      ],
    });
    expect(d).toBe("M 3.00 4.00 L 5.00 6.00");
  });

  it("prepends move when cubic is the first segment", () => {
    const d = pieceToSvgPath({
      id: "cubic-first",
      paths: [
        {
          type: "cubic",
          from: { x: 7, y: 8 },
          cp1: { x: 9, y: 10 },
          cp2: { x: 11, y: 12 },
          to: { x: 13, y: 14 },
        },
      ],
    });
    expect(d).toBe("M 7.00 8.00 C 9.00 10.00 11.00 12.00 13.00 14.00");
  });

  it("returns empty string for empty paths", () => {
    expect(pieceToSvgPath({ id: "empty", paths: [] })).toBe("");
  });

  it("starts a new subpath when the next segment does not continue the pen", () => {
    const d = pieceToSvgPath({
      id: "disconnected",
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
        },
      ],
    });
    expect(d).toBe("M 0.00 0.00 L 10.00 0.00 M 0.00 5.00 L 0.00 10.00");
  });

  it("starts cubic at from when it does not continue the pen", () => {
    const d = pieceToSvgPath({
      id: "disconnected-cubic",
      paths: [
        {
          type: "line",
          from: { x: 0, y: 0 },
          to: { x: 10, y: 10 },
        },
        {
          type: "cubic",
          from: { x: 1, y: 1 },
          cp1: { x: 2, y: 2 },
          cp2: { x: 3, y: 3 },
          to: { x: 4, y: 4 },
        },
      ],
    });
    expect(d).toBe(
      "M 0.00 0.00 L 10.00 10.00 M 1.00 1.00 C 2.00 2.00 3.00 3.00 4.00 4.00"
    );
  });
});

describe("renderDraftToSvg", () => {
  it("renders svg for drafted pieces", () => {
    const result = draft(measurements);
    const svg = renderDraftToSvg(result);
    expect(svg).toContain("<svg");
    expect(svg).toContain("<path d=");
    expect(svg).toMatch(/width="\d+"/);
    expect(svg).toMatch(/viewBox="0 0 \d+ \d+"/);
  });

  it("renders multiple paths for full blouse", () => {
    const result = draft(measurements);
    const svg = renderDraftToSvg(result);
    expect(svg).toContain("<svg");
    const pathCount = (svg.match(/<path d=/g) ?? []).length;
    expect(pathCount).toBeGreaterThanOrEqual(2);
  });
});
