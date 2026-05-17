import { describe, expect, it } from "vitest";
import { draft } from "../../engine/index.js";
import { fromDraft } from "../adapters/from-draft.js";
import { moveNode } from "../document.js";
import { parseDartFromDashed } from "./dart-geometry.js";
import { syncConstructionGuides } from "./sync.js";

const measurements = {
  bust: 90,
  height: 60,
  waist: 70,
  wrist: 16,
  sleeveLength: 58,
};

function blouseDoc() {
  const result = draft(measurements, { productId: "blusa" });
  return fromDraft(result, { productId: "blusa", seamAllowanceCm: 1 });
}

describe("dart geometry", () => {
  it("parses three-legged dart without shoulder width as spread", () => {
    const result = draft(measurements, { productId: "blusa" });
    const back = result.pieces.find((p) => p.id === "blouse-back")!;
    const parsed = parseDartFromDashed(back.paths);
    expect(parsed).not.toBeNull();
    expect(parsed!.spread).toBeGreaterThan(0);
    const doc = blouseDoc();
    const piece = doc.pieces.find((p) => p.id === "blouse-back")!;
    expect(piece.construction!.scalars.dartSpreadRatio).toBeLessThan(0.15);
  });
});

describe("syncConstructionGuides", () => {
  it("stores proportional dart ratios on blouse back", () => {
    const doc = blouseDoc();
    const piece = doc.pieces.find((p) => p.id === "blouse-back")!;
    const s = piece.construction!.scalars;
    expect(s.suppressDarts).toBe(false);
    expect(s.dartSpreadRatio).toBeGreaterThan(0);
    expect(s.dartSpreadRatio).toBeLessThan(0.2);
    expect(s.dartOffsetFromSide).toBeGreaterThan(0);
  });

  it("keeps dart legs inside piece width after side move", () => {
    const doc = blouseDoc();
    const piece = doc.pieces.find((p) => p.id === "blouse-back")!;
    const cut = piece.paths.find((p) => p.role === "cut")!;
    const plus = piece.paths.find((p) => p.guideKind === "dart_plus")!;
    const minus = piece.paths.find((p) => p.guideKind === "dart_minus")!;
    const center = piece.paths.find((p) => p.guideKind === "dart_center")!;
    const sideId = piece.construction!.anchorBindings.side_bottom!;
    const side = cut!.nodes.find((n) => n.id === sideId)!;
    const minX = Math.min(...cut!.nodes.map((n) => n.x));
    const maxX = Math.max(...cut!.nodes.map((n) => n.x));

    moveNode(doc, piece.id, cut!.id, sideId, side.x + 8, side.y);

    for (const guide of [plus!, minus!, center!]) {
      for (const n of guide.nodes) {
        expect(n.x).toBeGreaterThanOrEqual(minX - 1);
        expect(n.x).toBeLessThanOrEqual(maxX + 1);
      }
    }
    expect(plus!.nodes[1]!.x).toBeGreaterThan(center!.nodes[1]!.x);
    expect(minus!.nodes[1]!.x).toBeLessThan(center!.nodes[1]!.x);
  });

  it("updates all three dart guides when side hem node moves on front", () => {
    const doc = blouseDoc();
    const piece = doc.pieces.find((p) => p.id === "blouse-front")!;
    const cut = piece.paths.find((p) => p.role === "cut")!;
    const center = piece.paths.find((p) => p.guideKind === "dart_center")!;
    const plus = piece.paths.find((p) => p.guideKind === "dart_plus")!;
    const minus = piece.paths.find((p) => p.guideKind === "dart_minus")!;
    const sideId = piece.construction!.anchorBindings.side_bottom!;
    const side = cut!.nodes.find((n) => n.id === sideId)!;
    const centerXBefore = center!.nodes[0]!.x;
    const plusHemXBefore = plus!.nodes[1]!.x;
    moveNode(doc, piece.id, cut!.id, sideId, side.x + 15, side.y);
    expect(center!.nodes[0]!.x).not.toBe(centerXBefore);
    expect(plus!.nodes[1]!.x).not.toBe(plusHemXBefore);
    expect(plus!.nodes[1]!.x).toBeGreaterThan(center!.nodes[1]!.x);
    expect(minus!.nodes[1]!.x).toBeLessThan(center!.nodes[1]!.x);
  });

  it("keeps cf axis on bound nodes when cf hem moves", () => {
    const doc = blouseDoc();
    const piece = doc.pieces.find((p) => p.id === "blouse-back")!;
    const cut = piece.paths.find((p) => p.role === "cut")!;
    const cf = piece.paths.find((p) => p.guideKind === "cf_axis")!;
    const hemId = piece.construction!.anchorBindings.cf_hem!;
    const neckId = piece.construction!.anchorBindings.cf_neck!;
    const hem = cut!.nodes.find((n) => n.id === hemId)!;
    const neck = cut!.nodes.find((n) => n.id === neckId)!;
    moveNode(doc, piece.id, cut!.id, hemId, hem.x + 12, hem.y - 8);
    const movedHem = cut!.nodes.find((n) => n.id === hemId)!;
    expect(cf!.nodes[1]!.x).toBeCloseTo(movedHem.x, 1);
    expect(cf!.nodes[1]!.y).toBeCloseTo(movedHem.y, 1);
    expect(cf!.nodes[0]!.x).toBeCloseTo(neck.x, 1);
    expect(cf!.nodes[0]!.y).toBeCloseTo(neck.y, 1);
  });

  it("anchors dart feet on hem segment when cf hem moves diagonally", () => {
    const doc = blouseDoc();
    const piece = doc.pieces.find((p) => p.id === "blouse-back")!;
    const cut = piece.paths.find((p) => p.role === "cut")!;
    const center = piece.paths.find((p) => p.guideKind === "dart_center")!;
    const hemId = piece.construction!.anchorBindings.cf_hem!;
    const sideId = piece.construction!.anchorBindings.side_bottom!;
    const hem = cut!.nodes.find((n) => n.id === hemId)!;
    const side = cut!.nodes.find((n) => n.id === sideId)!;
    moveNode(doc, piece.id, cut!.id, hemId, hem.x + 15, hem.y - 5);
    const movedHem = cut!.nodes.find((n) => n.id === hemId)!;
    const foot = center!.nodes[1]!;
    const t = (foot.x - movedHem.x) / (side.x - movedHem.x);
    const expectedY = movedHem.y + t * (side.y - movedHem.y);
    expect(foot.y).toBeCloseTo(expectedY, 1);
    expect(foot.x).toBeGreaterThan(movedHem.x);
    expect(foot.x).toBeLessThan(side.x);
  });

  it("does not shift dart center x when only cf hem corner moves horizontally", () => {
    const doc = blouseDoc();
    const piece = doc.pieces.find((p) => p.id === "blouse-back")!;
    const cut = piece.paths.find((p) => p.role === "cut")!;
    const dart = piece.paths.find((p) => p.guideKind === "dart_center")!;
    const hemId = piece.construction!.anchorBindings.cf_hem!;
    const hem = cut!.nodes.find((n) => n.id === hemId)!;
    const dartX0 = dart!.nodes[0]!.x;
    moveNode(doc, piece.id, cut!.id, hemId, hem.x - 20, hem.y);
    expect(dart!.nodes[0]!.x).toBeCloseTo(dartX0, 0);
  });

  it("does not update dart guides when unrelated node moves", () => {
    const doc = blouseDoc();
    const piece = doc.pieces.find((p) => p.id === "blouse-front")!;
    const cut = piece.paths.find((p) => p.role === "cut")!;
    const dart = piece.paths.find((p) => p.guideKind === "dart_center")!;
    const bound = new Set(Object.values(piece.construction!.anchorBindings));
    const free = cut!.nodes.find(
      (n) => !bound.has(n.id) && n.y < cut!.nodes.reduce((m, x) => Math.max(m, x.y), 0) * 0.5
    );
    expect(free).toBeDefined();
    const x0 = dart!.nodes[0]!.x;
    const changed = syncConstructionGuides(piece, cut!.id, free!.id);
    expect(changed).toBe(false);
    expect(dart!.nodes[0]!.x).toBe(x0);
  });
});
