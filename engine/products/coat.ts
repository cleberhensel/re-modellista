import { buildContext } from "../context.js";
import { computeBounds } from "../bounds.js";
import { draftBlouseBack } from "../pieces/blouse-back.js";
import { draftBlouseFront } from "../pieces/blouse-front.js";
import { draftSleevePiece } from "../pieces/sleeve.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftCoat(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const ease = measurements.designEaseBust ?? 6;
  const coatLength = measurements.coatLength ?? measurements.height + 20;
  const ctx = buildContext(
    {
      ...measurements,
      bust: measurements.bust + ease,
      height: coatLength,
    },
    options
  );
  const front = draftBlouseFront(ctx);
  const back = draftBlouseBack(ctx);
  const sleeve = draftSleevePiece(ctx, 1.08);
  const pieces = [front, back, sleeve].filter(
    (p) => p.paths.length > 0 || p.error
  );
  return {
    productId: "casaco",
    ctx,
    pieces,
    bounds: computeBounds(pieces, ctx),
    meta: { designEaseBust: ease },
  };
}
