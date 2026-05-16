import { buildContext } from "../context.js";
import { computeBounds } from "../bounds.js";
import { draftBlouseBack } from "../pieces/blouse-back.js";
import { draftBlouseFront } from "../pieces/blouse-front.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftBlouse(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const ctx = buildContext(measurements, options);
  const front = draftBlouseFront(ctx);
  const back = draftBlouseBack(ctx);
  const pieces = [];
  if (front.paths.length > 0 || front.error) {
    pieces.push(front);
  }
  if (back.paths.length > 0 || back.error) {
    pieces.push(back);
  }
  return {
    productId: "blusa",
    ctx,
    pieces,
    bounds: computeBounds(pieces, ctx),
  };
}
