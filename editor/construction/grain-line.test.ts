import { describe, expect, it } from "vitest";
import { draft } from "../../engine/index.js";
import { fromDraft } from "../adapters/from-draft.js";
import { moveNode } from "../document.js";
import { resolveAnchors } from "./anchors.js";

const m = {
  bust: 90,
  height: 60,
  waist: 70,
  wrist: 16,
  sleeveLength: 58,
};

describe("grain line", () => {
  it("spans cut top to hem at center x on blouse back", () => {
    const doc = fromDraft(draft(m, { productId: "blusa" }), {
      productId: "blusa",
      seamAllowanceCm: 1,
    });
    const piece = doc.pieces.find((p) => p.id === "blouse-back")!;
    const cut = piece.paths.find((p) => p.role === "cut")!;
    const grain = piece.paths.find((p) => p.guideKind === "grain")!;
    const anchors = resolveAnchors(piece, piece.construction!)!;
    const hemId = piece.construction!.anchorBindings.cf_hem!;
    const sideId = piece.construction!.anchorBindings.side_bottom!;
    const hem = cut.nodes.find((n) => n.id === hemId)!;
    const side = cut.nodes.find((n) => n.id === sideId)!;
    const maxY = Math.max(...cut.nodes.map((n) => n.y));

    expect(grain!.nodes[0]!.y).toBeCloseTo(anchors.grainTop.y, 0);
    expect(grain!.nodes[1]!.y).toBeCloseTo(anchors.grainBottom.y, 0);
    expect(anchors.grainTop.y).toBeLessThan(anchors.grainBottom.y);
    expect(anchors.grainBottom.y).toBeCloseTo(maxY, 0);
    expect(anchors.grainBottom.x).toBeGreaterThan(hem.x);
    expect(anchors.grainBottom.x).toBeLessThan(side.x);
  });

  it("keeps grain x stable when cf hem moves", () => {
    const doc = fromDraft(draft(m, { productId: "blusa" }), {
      productId: "blusa",
      seamAllowanceCm: 1,
    });
    const piece = doc.pieces.find((p) => p.id === "blouse-back")!;
    const cut = piece.paths.find((p) => p.role === "cut")!;
    const grain = piece.paths.find((p) => p.guideKind === "grain")!;
    const hemId = piece.construction!.anchorBindings.cf_hem!;
    const hem = cut.nodes.find((n) => n.id === hemId)!;
    const x0 = grain!.nodes[0]!.x;
    moveNode(doc, piece.id, cut.id, hemId, hem.x - 20, hem.y);
    expect(grain!.nodes[0]!.x).toBeCloseTo(x0, 0);
    expect(grain!.nodes[1]!.x).toBeCloseTo(x0, 0);
  });
});
