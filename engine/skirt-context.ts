import { DEFAULT_MARGIN_CM, DEFAULT_PX_PER_CM } from "./constants.js";
import type { DraftOptions, SkirtContext, SkirtMeasurements } from "./types.js";

export function buildSkirtContext(
  measurements: SkirtMeasurements,
  options: DraftOptions = {}
): SkirtContext {
  const k = options.pxPerCm ?? DEFAULT_PX_PER_CM;
  const margin = options.marginCm ?? DEFAULT_MARGIN_CM;
  const startOne = margin + k;
  const waistQuarterPx = Math.floor(measurements.waist / 4) * k;
  const hipQuarterPx = Math.floor(measurements.hip / 4) * k;
  const hipLineY = startOne + measurements.hipDepth * k;
  const hemY = startOne + measurements.skirtLength * k;
  return {
    measurements,
    k,
    startOne,
    waistQuarterPx,
    hipQuarterPx,
    hipLineY,
    hemY,
  };
}
