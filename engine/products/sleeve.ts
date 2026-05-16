import { buildContext } from "../context.js";
import { computeBounds } from "../bounds.js";
import { draftSleevePiece, armholeLengthFromContext } from "../pieces/sleeve.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftSleeve(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const ctx = buildContext(measurements, options);
  const sleeve = draftSleevePiece(ctx);
  const pieces = sleeve.paths.length > 0 || sleeve.error ? [sleeve] : [];
  const armholeLength = armholeLengthFromContext(ctx) ?? 0;
  return {
    productId: "manga",
    ctx,
    pieces,
    bounds: computeBounds(pieces, ctx),
    meta: { armholeLength },
  };
}
