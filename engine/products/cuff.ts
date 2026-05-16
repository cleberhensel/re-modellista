import { buildContext } from "../context.js";
import { computeBounds } from "../bounds.js";
import { draftCuff } from "../pieces/cuff.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftCuffProduct(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const ctx = buildContext(measurements, options);
  const piece = draftCuff(ctx);
  const pieces = [piece];
  return {
    productId: "punho",
    ctx,
    pieces,
    bounds: computeBounds(pieces, ctx),
  };
}
