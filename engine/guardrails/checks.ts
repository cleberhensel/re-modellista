import { buildContext } from "../context.js";
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
