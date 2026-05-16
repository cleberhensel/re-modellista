import { DEFAULT_MARGIN_CM, DEFAULT_PX_PER_CM } from "./constants.js";
import { seventhFromBustCm, seventhToPx } from "./seventh.js";
import type { DraftContext, DraftOptions, Measurements } from "./types.js";

export function buildContext(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftContext {
  const k = options.pxPerCm ?? DEFAULT_PX_PER_CM;
  const margin = options.marginCm ?? DEFAULT_MARGIN_CM;
  const startOne = margin + k;
  const startTwo = margin;
  const start = startOne;
  const bust = measurements.bust;
  const height = measurements.height;
  const waist = measurements.waist;
  const seventh = seventhFromBustCm(bust);
  const s = seventhToPx(seventh, k);
  const widthPx = Math.ceil((Math.floor(bust) / 4) * k);
  const heightPx = Math.ceil(Math.floor(height) * k);
  const hipPx = (Math.floor(waist) / 4) * k;

  return {
    measurements,
    k,
    margin,
    start,
    startOne,
    startTwo,
    widthPx,
    heightPx,
    hipPx,
    seventh,
    s,
    formulas: {
      bustQuarterCm: bust / 4,
      bustHalfCm: Math.floor(bust) / 2,
      seventhOneCm: seventh.one,
      seventhTwoCm: seventh.two,
      seventhFourCm: seventh.four,
      widthPx,
      heightPx,
      hipPx,
      shoulderY: s.two + startOne,
      armholeLineY: s.one * 3 + s.two + startOne,
    },
  };
}
