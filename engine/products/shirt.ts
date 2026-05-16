import { buildContext } from "../context.js";
import { computeBounds } from "../bounds.js";
import { draftBlouseBack } from "../pieces/blouse-back.js";
import { draftBlouseFront } from "../pieces/blouse-front.js";
import { draftSleevePiece } from "../pieces/sleeve.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftShirt(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const ctx = buildContext(measurements, options);
  const front = draftBlouseFront(ctx);
  const back = draftBlouseBack(ctx);
  const sleeve = draftSleevePiece(ctx);
  const pieces = [front, back, sleeve].filter(
    (p) => p.paths.length > 0 || p.error
  );
  return {
    productId: "camisa",
    ctx,
    pieces,
    bounds: computeBounds(pieces, ctx),
  };
}
