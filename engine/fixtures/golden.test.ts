import { describe, expect, it, vi } from "vitest";
import { draftShirt } from "../products/shirt.js";
import * as blouseFrontModule from "../pieces/blouse-front.js";
import * as cuffModule from "../pieces/cuff.js";
import { draftProduct } from "../registry.js";
import {
  defaultBodiceMeasurements,
  goldenBlouseBackKeyPoints,
  goldenBlouseFrontKeyPoints,
} from "./blouse-golden.js";
import { goldenPantFrontCrotchLineY, goldenPantFrontHasOutline } from "./pant-golden.js";
import {
  goldenShirtCollarNecklineLength,
  goldenShirtPieceCount,
  goldenShirtSleeveArmholeLength,
} from "./shirt-golden.js";
import * as skirtFrontModule from "../pieces/skirt-front.js";
import { goldenSkirtFrontHipLineY, goldenSkirtFrontWaistX } from "./skirt-golden.js";
import { buildContext } from "../context.js";
import { buildSkirtContext, resolveWaistMismatch } from "../skirt-context.js";
import { capEaseTargetPx, crotchDepthFallbackCm } from "../ease.js";
import { expectPointClose } from "./golden-utils.js";

describe("golden fixtures", () => {
  it("blouse front key points are finite", () => {
    const pts = goldenBlouseFrontKeyPoints();
    expect(pts.intersection.x).toBeGreaterThan(pts.shoulderStart.x);
    expect(pts.p4.y).toBeGreaterThan(pts.intersection.y);
  });

  it("blouse back shoulder starts left of front", () => {
    const front = goldenBlouseFrontKeyPoints();
    const back = goldenBlouseBackKeyPoints();
    expect(back.shoulderStart.x).toBeLessThan(front.shoulderStart.x);
  });

  it("shirt keeps pieces that only expose errors", () => {
    vi.spyOn(blouseFrontModule, "draftBlouseFront").mockReturnValue({
      id: "blouse-front",
      paths: [],
      error: "shoulder_virtual_no_intersection",
    });
    const result = draftShirt(defaultBodiceMeasurements);
    expect(result.pieces.some((p) => p.error)).toBe(true);
    vi.restoreAllMocks();
  });

  it("shirt drops empty pieces without errors", () => {
    vi.spyOn(cuffModule, "draftCuff").mockReturnValue({
      id: "cuff",
      paths: [],
    });
    const result = draftShirt(defaultBodiceMeasurements);
    expect(result.pieces.some((p) => p.id === "cuff")).toBe(false);
    vi.restoreAllMocks();
  });

  it("skirt waist x uses fallback when outline is not cubic", () => {
    vi.spyOn(skirtFrontModule, "draftSkirtFront").mockReturnValue({
      id: "skirt-front",
      paths: [
        {
          type: "line",
          from: { x: 0, y: 0 },
          to: { x: 120, y: 0 },
        },
      ],
    });
    expect(goldenSkirtFrontWaistX()).toBeGreaterThan(50);
    vi.restoreAllMocks();
  });

  it("shirt drafts eight pieces", () => {
    const result = draftProduct("camisa", {
      ...defaultBodiceMeasurements,
      hip: 96,
      hipDepth: 20,
      skirtLength: 60,
      crotchDepth: 26,
      inseam: 78,
    });
    expect(result.pieces.filter((p) => p.paths.length > 0).length).toBe(
      goldenShirtPieceCount()
    );
  });

  it("collar neckline length is positive", () => {
    expect(goldenShirtCollarNecklineLength()).toBeGreaterThan(100);
  });

  it("shirt sleeve armhole length is positive", () => {
    expect(goldenShirtSleeveArmholeLength()).toBeGreaterThan(0);
  });

  it("ease helpers return positive values", () => {
    expect(crotchDepthFallbackCm(70)).toBeGreaterThan(20);
    expect(capEaseTargetPx(10)).toBeGreaterThan(30);
  });

  it("resolveWaistMismatch keeps aligned skirt context", () => {
    const blouseCtx = buildContext(defaultBodiceMeasurements);
    const skirtCtx = buildSkirtContext({
      waist: defaultBodiceMeasurements.waist,
      hip: 96,
      hipDepth: 20,
      skirtLength: 60,
    });
    const aligned = {
      ...skirtCtx,
      waistFrontQuarterPx: blouseCtx.hipPx,
    };
    expect(resolveWaistMismatch(blouseCtx, aligned)).toBe(aligned);
  });

  it("skirt hip line below waist", () => {
    const ctxHip = goldenSkirtFrontHipLineY();
    expect(ctxHip).toBeGreaterThan(50);
    expect(goldenSkirtFrontWaistX()).toBeGreaterThan(50);
  });

  it("pant crotch line and outline", () => {
    expect(goldenPantFrontCrotchLineY()).toBeGreaterThan(100);
    expect(goldenPantFrontHasOutline()).toBe(true);
  });

  it("expectPointClose utility", () => {
    expectPointClose({ x: 10, y: 20 }, { x: 11, y: 19 }, 2);
  });
});
