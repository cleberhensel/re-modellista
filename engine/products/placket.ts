import { buildContext } from "../context.js";
import { computeBounds } from "../bounds.js";
import { draftPlacket } from "../pieces/placket.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftPlacketProduct(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const ctx = buildContext(measurements, options);
  const piece = draftPlacket(ctx);
  return {
    productId: "carcela",
    ctx,
    pieces: [piece],
    bounds: computeBounds([piece], ctx),
  };
}
