import { describe, expect, it } from "vitest";
import { draft } from "../../engine/index.js";
import { fromDraft } from "../adapters/from-draft.js";
import { parseDartFromDashed } from "./dart-geometry.js";
import { resolveAnchors } from "./anchors.js";

const skirtM = {
  waist: 70,
  hip: 96,
  hipDepth: 20,
  skirtLength: 60,
};

describe("skirt dart", () => {
  it("matches motor dart apex and spread on skirt front", () => {
    const draftResult = draft(skirtM, { productId: "saia-reta" });
    const motor = draftResult.pieces.find((p) => p.id === "skirt-front")!;
    const parsed = parseDartFromDashed(motor.paths)!;

    const doc = fromDraft(draftResult, {
      productId: "saia-reta",
      seamAllowanceCm: 1,
    });
    const piece = doc.pieces.find((p) => p.id === "skirt-front")!;
    const anchors = resolveAnchors(piece, piece.construction!)!;

    expect(Math.abs(anchors.dartCenterX - parsed.apex.x)).toBeLessThan(2);
    expect(Math.abs(anchors.dartTopY - parsed.apex.y)).toBeLessThan(2);
    expect(Math.abs(anchors.dartSpread - parsed.spread)).toBeLessThan(1);
    expect(anchors.dartFootCenter.y).toBeCloseTo(parsed.hemCenter.y, 0);
  });

  it("matches motor dart on skirt back", () => {
    const draftResult = draft(skirtM, { productId: "saia-reta" });
    const motor = draftResult.pieces.find((p) => p.id === "skirt-back")!;
    const parsed = parseDartFromDashed(motor.paths)!;

    const doc = fromDraft(draftResult, {
      productId: "saia-reta",
      seamAllowanceCm: 1,
    });
    const piece = doc.pieces.find((p) => p.id === "skirt-back")!;
    const anchors = resolveAnchors(piece, piece.construction!)!;

    expect(Math.abs(anchors.dartCenterX - parsed.apex.x)).toBeLessThan(2);
    expect(Math.abs(anchors.dartTopY - parsed.apex.y)).toBeLessThan(2);
    expect(Math.abs(anchors.dartSpread - parsed.spread)).toBeLessThan(1.5);
  });
});
