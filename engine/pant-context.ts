import { DEFAULT_MARGIN_CM, DEFAULT_PX_PER_CM } from "./constants.js";
import { crotchDepthFallbackCm } from "./ease.js";
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
  const crotchDepthCm =
    measurements.crotchDepth ?? crotchDepthFallbackCm(measurements.waist);
  const crotchLineY = startOne + crotchDepthCm * k;
  const inseamCm = measurements.inseam;
  const legLengthCm =
    options.legLengthCm ?? measurements.outseam ?? inseamCm + crotchDepthCm;
  const outseamPx = legLengthCm * k;
  const frontExtension = (measurements.hip / 12 + 1.5) * k;
  const backExtension = frontExtension + 4 * k;
  return {
    measurements: { ...measurements, crotchDepth: crotchDepthCm },
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
