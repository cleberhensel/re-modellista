import { DEFAULT_MARGIN_CM, DEFAULT_PX_PER_CM } from "./constants.js";
import type { DraftOptions, PantContext, PantMeasurements } from "./types.js";

export function buildPantContext(
  measurements: PantMeasurements,
  options: DraftOptions = {}
): PantContext {
  const k = options.pxPerCm ?? DEFAULT_PX_PER_CM;
  const margin = options.marginCm ?? DEFAULT_MARGIN_CM;
  const startOne = margin + k;
  const waistQuarterPx = (measurements.waist / 4) * k;
  const hipQuarterPx = (measurements.hip / 4) * k;
  const crotchLineY = startOne + measurements.crotchDepth * k;
  const outseamPx = (measurements.inseam + measurements.crotchDepth) * k;
  const frontExtension = ((measurements.hip / 2) / 8) * k;
  const backExtension = frontExtension + 2.5 * k;
  return {
    measurements,
    k,
    startOne,
    waistQuarterPx,
    hipQuarterPx,
    crotchLineY,
    outseamPx,
    frontExtension,
    backExtension,
  };
}
