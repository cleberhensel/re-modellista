import { buildContext } from "../context.js";
import { computeBounds } from "../bounds.js";
import { buildSkirtContext } from "../skirt-context.js";
import { draftBlouseBack } from "../pieces/blouse-back.js";
import { draftBlouseFront } from "../pieces/blouse-front.js";
import { draftSkirtBack } from "../pieces/skirt-back.js";
import { draftSkirtFront } from "../pieces/skirt-front.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftDress(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const bodiceLength = measurements.bodiceLength ?? measurements.height;
  const blouseCtx = buildContext(
    {
      bust: measurements.bust,
      height: bodiceLength,
      waist: measurements.waist,
      wrist: measurements.wrist,
      sleeveLength: measurements.sleeveLength,
    },
    options
  );
  const skirtCtx = buildSkirtContext(
    {
      waist: measurements.waist,
      hip: measurements.hip ?? measurements.waist + 10,
      hipDepth: measurements.hipDepth ?? 20,
      skirtLength: measurements.skirtLength ?? 60,
    },
    options
  );
  const waistBlouse = Math.floor(blouseCtx.measurements.waist / 4) * blouseCtx.k;
  const waistSkirt = skirtCtx.waistQuarterPx;
  if (Math.abs(waistBlouse - waistSkirt) > blouseCtx.k * 2) {
    return {
      productId: "vestido",
      ctx: blouseCtx,
      pieces: [],
      bounds: { width: 400, height: 400 },
      error: "waist_mismatch",
    };
  }
  const pieces = [
    draftBlouseFront(blouseCtx),
    draftBlouseBack(blouseCtx),
    draftSkirtFront(skirtCtx),
    draftSkirtBack(skirtCtx),
  ];
  return {
    productId: "vestido",
    ctx: blouseCtx,
    pieces,
    bounds: computeBounds(pieces, blouseCtx),
  };
}
