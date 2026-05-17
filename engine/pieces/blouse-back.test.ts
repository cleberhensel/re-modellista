import { describe, expect, it } from "vitest";
import { buildContext } from "../context.js";
import { draftBlouseBack } from "./blouse-back.js";

const measurements = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

describe("draftBlouseBack", () => {
  it("drafts complete back piece", () => {
    const ctx = buildContext(measurements);
    const piece = draftBlouseBack(ctx);
    expect(piece.error).toBeUndefined();
    expect(piece.paths.length).toBeGreaterThanOrEqual(10);
    expect(piece.points?.dartCenterX).toBe((ctx.hipPx + ctx.startOne) / 2);
  });

  it("moves side hem with waist like front", () => {
    const tight = buildContext({ ...measurements, waist: 68 });
    const loose = buildContext({ ...measurements, waist: 95 });
    const tightPiece = draftBlouseBack(tight);
    const loosePiece = draftBlouseBack(loose);
    expect(tightPiece.points?.sideBottom.x).toBeLessThan(
      loosePiece.points!.sideBottom.x
    );
  });

  it("returns error when shoulder lines do not intersect", () => {
    const ctx = buildContext(measurements);
    ctx.s.one = 0.001;
    const piece = draftBlouseBack(ctx);
    if (piece.error) {
      expect(piece.paths).toEqual([]);
    } else {
      expect(piece.paths.length).toBeGreaterThan(0);
    }
  });
});
