import { describe, expect, it, vi } from "vitest";
import { draftProduct } from "./registry.js";
import { buildContext } from "./context.js";
import * as skirtModule from "./skirt-context.js";
import * as blouseFrontModule from "./pieces/blouse-front.js";
import * as blouseBackModule from "./pieces/blouse-back.js";
import { composeGarment } from "./composition/compose.js";
import { listRecipeProductIds } from "./composition/registry.js";
import { draftDress } from "./products/dress.js";
import { draftVest } from "./products/vest.js";
import { draftSidePocket } from "./pieces/side-pocket.js";
import { shirtGuardrails } from "./guardrails/shirt.js";
import { blouseStability, blouseGuardrails } from "./guardrails/blouse.js";
import * as checksModule from "./guardrails/checks.js";
import {
  dartClearsArmhole,
  isBlouseBackStable,
  isBlouseStable,
  shoulderBackIntersects,
  shoulderIntersects,
} from "./guardrails/checks.js";
import { dressGuardrails } from "./guardrails/dress.js";
import { skirtGuardrails } from "./guardrails/skirt.js";
import { pantGuardrails } from "./guardrails/pant.js";
import { waistbandGuardrails } from "./guardrails/waistband.js";
import { goldenBlouseFrontCollarEnd } from "./fixtures/blouse-golden.js";
import { computeArmholePoints } from "./armhole.js";
import { draftBlouseFront } from "./pieces/blouse-front.js";
import { draftBlouseBack } from "./pieces/blouse-back.js";
import {
  armholeLengthFromContext,
  armholeLengthsFromContext,
  draftSleevePiece,
} from "./pieces/sleeve.js";
import { createGuardrails } from "./guardrails/util.js";
import { addSleeveHandle } from "./sleeve-handles.js";
import { point } from "./geometry.js";
import type { Measurements } from "./types.js";

const m: Measurements = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

describe("coverage paths", () => {
  it("covers dress waist mismatch branch", () => {
    const badSkirt = {
      measurements: { waist: 70, hip: 96, hipDepth: 20, skirtLength: 60 },
      k: 28.347,
      startOne: 43.347,
      waistFrontQuarterPx: 999,
      waistBackQuarterPx: 999,
      hipQuarterPx: 600,
      hipLineY: 100,
      hemY: 500,
    };
    vi.spyOn(skirtModule, "buildSkirtContext").mockReturnValue(badSkirt);
    vi.spyOn(skirtModule, "resolveWaistMismatch").mockReturnValue(badSkirt);
    expect(
      draftDress({
        ...m,
        bodiceLength: 42,
        hip: 96,
        hipDepth: 20,
        skirtLength: 60,
      }).error
    ).toBe("waist_mismatch");
    vi.restoreAllMocks();
  });

  it("covers armhole lengths back fallback", () => {
    vi.spyOn(blouseFrontModule, "draftBlouseFront").mockReturnValue({
      id: "blouse-front",
      paths: [{ type: "line", from: point(0, 0), to: point(1, 1) }],
      points: { intersection: { x: 100, y: 200 } },
    });
    vi.spyOn(blouseBackModule, "draftBlouseBack").mockReturnValue({
      id: "blouse-back",
      paths: [{ type: "line", from: point(0, 0), to: point(1, 1) }],
      points: {},
    });
    const lengths = armholeLengthsFromContext(buildContext(m));
    expect(lengths?.front).toBeGreaterThan(0);
    expect(lengths?.back).toBeGreaterThan(0);
    vi.restoreAllMocks();
  });

  it("covers sleeve armhole unavailable", () => {
    vi.spyOn(blouseFrontModule, "draftBlouseFront").mockReturnValue({
      id: "blouse-front",
      paths: [],
      error: "shoulder_virtual_no_intersection",
    });
    const piece = draftSleevePiece(buildContext(m));
    expect(piece.error).toBe("sleeve_armhole_unavailable");
    vi.restoreAllMocks();
  });

  it("covers armhole length null", () => {
    vi.spyOn(blouseFrontModule, "draftBlouseFront").mockReturnValue({
      id: "blouse-front",
      paths: [],
      error: "e",
    });
    expect(armholeLengthFromContext(buildContext(m))).toBeNull();
    vi.restoreAllMocks();
  });

  it("covers pocket and collar errors", () => {
    vi.spyOn(blouseFrontModule, "draftBlouseFront").mockReturnValue({
      id: "blouse-front",
      paths: [],
      error: "e",
    });
    expect(draftProduct("bolso-peito", m).pieces).toEqual([]);
    expect(draftProduct("colarinho", m).pieces.length).toBeGreaterThan(0);
    vi.restoreAllMocks();
  });

  it("covers shoulder and dart checks", async () => {
    const ctx = buildContext(m);
    ctx.widthPx = ctx.s.one + 1e-8;
    expect(shoulderIntersects(ctx)).toBe(false);
    const ctxBack = buildContext(m);
    ctxBack.widthPx = ctxBack.s.one - ctxBack.k;
    expect(shoulderBackIntersects(ctxBack)).toBe(false);
    const short = buildContext({ ...m, height: 30 });
    expect(dartClearsArmhole(short)).toBe(false);
    const geo = await import("./geometry.js");
    vi.spyOn(geo, "lineIntersection").mockReturnValue(null);
    expect(isBlouseBackStable(m)).toBe(false);
    vi.restoreAllMocks();
    vi.spyOn(blouseFrontModule, "draftBlouseFront").mockReturnValue({
      id: "blouse-front",
      paths: [],
      error: "e",
    });
    expect(isBlouseStable(m)).toBe(false);
    vi.restoreAllMocks();
  });

  it("covers back piece intersection error", async () => {
    const geo = await import("./geometry.js");
    vi.spyOn(geo, "lineIntersection").mockReturnValue(null);
    const piece = draftBlouseBack(buildContext(m));
    expect(piece.error).toBe("shoulder_virtual_no_intersection");
    vi.restoreAllMocks();
  });

  it("covers blouse stability and golden collar", () => {
    expect(blouseStability(m).stable).toBe(true);
    expect(goldenBlouseFrontCollarEnd(m).x).toBeGreaterThan(0);
  });

  it("covers sleeveless and suppress darts", () => {
    const ctx = buildContext(m, { sleeveless: true, suppressDarts: true });
    expect(draftBlouseFront(ctx).paths.length).toBeGreaterThan(0);
    expect(draftBlouseBack(ctx).paths.length).toBeGreaterThan(0);
    computeArmholePoints(ctx, 100, { sleeveless: true });
  });

  it("covers guardrails util and defaults", () => {
    const g = createGuardrails("x", {}, () => ({ min: 1, max: 2 }));
    expect(g.getFieldRange(m, "bust").min).toBe(1);
    expect(g.resolve(m, "bust").bust).toBe(m.bust);
    skirtGuardrails.getFieldRange(m, "bust");
    pantGuardrails.getFieldRange(m, "bust");
    dressGuardrails.getFieldRange(m, "bust");
    waistbandGuardrails.getFieldRange(m, "height");
    waistbandGuardrails.getFieldRange(m, "bust");
    blouseGuardrails.getFieldRange(m, "designEaseBust");
  });

  it("covers blouse stabilize bust loop", () => {
    vi.spyOn(checksModule, "isBlouseStable").mockReturnValue(false);
    const resolved = blouseGuardrails.resolve(
      { ...m, height: 28, waist: 40, bust: 72 },
      "waist"
    );
    expect(resolved.bust).toBeGreaterThanOrEqual(72);
    const heightOnly = blouseGuardrails.resolve(
      { ...m, height: 28 },
      "height"
    );
    expect(heightOnly.height).toBeGreaterThanOrEqual(28);
    vi.restoreAllMocks();
  });

  it("covers sleeve centered cuff geometry", () => {
    const ctx = buildContext(m);
    const piece = draftSleevePiece(ctx);
    const segs = piece.paths;
    const right = segs[segs.length - 1];
    expect(right.type).toBe("line");
    if (right.type === "line") {
      expect(Math.abs(right.to.x - right.from.x)).toBeGreaterThan(1);
    }
  });

  it("covers composition extras", () => {
    expect(listRecipeProductIds()).toContain("blusa");
    expect(() => composeGarment("unknown", m)).toThrow("unknown_recipe");
    const coat = composeGarment(
      "casaco",
      { ...m, designEaseBust: 6, coatLength: 65 },
      { includeSidePocket: true }
    );
    expect(coat.pieces.map((p) => p.id)).toContain("side-pocket");
    expect(draftVest(m).productId).toBe("colete");
    const badFront = vi.spyOn(blouseFrontModule, "draftBlouseFront").mockReturnValue({
      id: "blouse-front",
      paths: [],
      error: "e",
    });
    expect(draftSidePocket(buildContext(m)).error).toBe("side_pocket_unavailable");
    badFront.mockRestore();
    const dressWithSleeve = composeGarment(
      "vestido",
      {
        ...m,
        bodiceLength: 42,
        hip: 96,
        hipDepth: 20,
        skirtLength: 60,
      },
      { includeSleeve: true }
    );
    expect(dressWithSleeve.pieces.map((p) => p.id)).toContain("sleeve");
    expect(
      shirtGuardrails.resolve(m, "bust", { includeSleeve: false }).bust
    ).toBe(m.bust);
  });

  it("covers sleeve handle zero length", () => {
    const verts = [
      { point: point(0, 0), handleIn: point(0, 0), handleOut: point(0, 0) },
      { point: point(0, 0), handleIn: point(0, 0), handleOut: point(0, 0) },
      { point: point(0, 0), handleIn: point(0, 0), handleOut: point(0, 0) },
    ];
    addSleeveHandle(verts, 1);
  });
});
