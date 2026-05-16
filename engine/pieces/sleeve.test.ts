import { describe, expect, it } from "vitest";
import { buildContext } from "../context.js";
import { pathLength } from "../geometry/pathLength.js";
import { draftSleevePiece } from "./sleeve.js";

const measurements = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

function sideSegmentLengths(piece: ReturnType<typeof draftSleevePiece>) {
  const segs = piece.paths;
  const capCount = segs.length - 3;
  const left = segs[capCount];
  const right = segs[capCount + 2];
  if (left.type !== "line" || right.type !== "line") {
    return null;
  }
  return {
    left: pathLength([left]),
    right: pathLength([right]),
  };
}

describe("draftSleevePiece", () => {
  it("has tapered underarm seams on both sides", () => {
    const ctx = buildContext(measurements);
    const piece = draftSleevePiece(ctx);
    expect(piece.error).toBeUndefined();
    const sides = sideSegmentLengths(piece);
    expect(sides).not.toBeNull();
    const ratio = sides!.left / sides!.right;
    expect(ratio).toBeGreaterThan(0.75);
    expect(ratio).toBeLessThan(1.25);
  });

  it("does not use a vertical-only right underarm", () => {
    const ctx = buildContext(measurements);
    const piece = draftSleevePiece(ctx);
    const segs = piece.paths;
    const right = segs[segs.length - 1];
    expect(right.type).toBe("line");
    if (right.type === "line") {
      const dx = Math.abs(right.to.x - right.from.x);
      const dy = Math.abs(right.to.y - right.from.y);
      expect(dx).toBeGreaterThan(1);
      expect(dy).toBeGreaterThan(1);
    }
  });
});
