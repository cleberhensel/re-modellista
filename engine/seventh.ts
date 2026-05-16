import { SEVENTH_HEAD_DIGITS } from "./constants.js";
import type { SeventhScale } from "./types.js";

export function seventhFromBustCm(bustCm: number): SeventhScale {
  const half = Math.floor(bustCm) / 2;
  const raw = half / 7;
  const one = parseInt(
    raw.toString().substring(0, SEVENTH_HEAD_DIGITS),
    10
  );
  return {
    one,
    two: one / 2,
    four: one / 4,
  };
}

export function seventhToPx(
  seventh: SeventhScale,
  pxPerCm: number
): SeventhScale {
  return {
    one: seventh.one * pxPerCm,
    two: seventh.two * pxPerCm,
    four: seventh.four * pxPerCm,
  };
}
