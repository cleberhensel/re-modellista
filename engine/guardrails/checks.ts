import { buildContext } from "../context.js";
import { draftBlouseBack } from "../pieces/blouse-back.js";
import { draftBlouseFront } from "../pieces/blouse-front.js";
import type { DraftContext, DraftOptions, Measurements } from "../types.js";

export function shoulderIntersects(ctx: DraftContext): boolean {
  const { startOne, widthPx, s } = ctx;
  const shoulderStartX = s.one + startOne;
  const shoulderEndX = widthPx + startOne;
  const divX = widthPx - s.two - s.four / 2 + startOne;
  const span = shoulderEndX - shoulderStartX;
  if (span <= 1e-6) {
    return false;
  }
  const t = (divX - shoulderStartX) / span;
  return t > 0.02 && t < 0.98;
}

export function shoulderBackIntersects(ctx: DraftContext): boolean {
  const { startOne, widthPx, s, k } = ctx;
  const shoulderStartX = s.one + startOne - k;
  const shoulderEndX = widthPx + startOne;
  const divX = widthPx - s.two - s.four / 2 + startOne;
  const span = shoulderEndX - shoulderStartX;
  if (span <= 1e-6) {
    return false;
  }
  const t = (divX - shoulderStartX) / span;
  return t > 0.02 && t < 0.98;
}

export function dartClearsArmhole(ctx: DraftContext): boolean {
  const { startOne, heightPx, s, k } = ctx;
  const hemY = heightPx + startOne;
  const dartTopY = hemY - 12 * k;
  const armholeLineY = s.one * 3 + s.two + startOne;
  return dartTopY >= armholeLineY + 2 * k;
}

export function isBlouseFrontStable(
  measurements: Measurements,
  options: DraftOptions = {}
): boolean {
  const ctx = buildContext(measurements, options);
  return shoulderIntersects(ctx) && dartClearsArmhole(ctx);
}

export function isBlouseBackStable(
  measurements: Measurements,
  options: DraftOptions = {}
): boolean {
  const ctx = buildContext(measurements, options);
  const back = draftBlouseBack(ctx);
  if (back.error) {
    return false;
  }
  return shoulderBackIntersects(ctx) && dartClearsArmhole(ctx);
}

export function isBlouseStable(
  measurements: Measurements,
  options: DraftOptions = {}
): boolean {
  const ctx = buildContext(measurements, options);
  const front = draftBlouseFront(ctx);
  if (front.error) {
    return false;
  }
  return (
    isBlouseFrontStable(measurements, options) &&
    isBlouseBackStable(measurements, options)
  );
}
