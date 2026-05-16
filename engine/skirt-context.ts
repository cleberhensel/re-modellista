import { DEFAULT_MARGIN_CM, DEFAULT_PX_PER_CM } from "./constants.js";
import {
  SKIRT_HIP_HALF_EASE_CM,
  SKIRT_WAIST_BACK_EASE_CM,
  SKIRT_WAIST_FRONT_EASE_CM,
} from "./ease.js";
import type { DraftContext, DraftOptions, SkirtContext, SkirtMeasurements } from "./types.js";

export function buildSkirtContext(
  measurements: SkirtMeasurements,
  options: DraftOptions = {}
): SkirtContext {
  const k = options.pxPerCm ?? DEFAULT_PX_PER_CM;
  const margin = options.marginCm ?? DEFAULT_MARGIN_CM;
  const startOne = margin + k;
  const waistFrontQuarterPx =
    (measurements.waist / 4 + SKIRT_WAIST_FRONT_EASE_CM) * k;
  const waistBackQuarterPx =
    (measurements.waist / 4 + SKIRT_WAIST_BACK_EASE_CM) * k;
  const hipQuarterPx = (measurements.hip / 2 + SKIRT_HIP_HALF_EASE_CM) * k;
  const hipLineY = startOne + measurements.hipDepth * k;
  const hemY = startOne + measurements.skirtLength * k;
  return {
    measurements,
    k,
    startOne,
    waistFrontQuarterPx,
    waistBackQuarterPx,
    hipQuarterPx,
    hipLineY,
    hemY,
  };
}

export function resolveWaistMismatch(
  blouseCtx: DraftContext,
  skirtCtx: SkirtContext
): SkirtContext {
  const target = blouseCtx.hipPx;
  const tolerance = blouseCtx.k * 2;
  if (Math.abs(skirtCtx.waistFrontQuarterPx - target) <= tolerance) {
    return skirtCtx;
  }
  const backDelta =
    skirtCtx.waistBackQuarterPx - skirtCtx.waistFrontQuarterPx;
  return {
    ...skirtCtx,
    waistFrontQuarterPx: target,
    waistBackQuarterPx: target + backDelta,
  };
}
