import { buildContext } from "../context.js";
import { computeBounds } from "../bounds.js";
import { draftWaistband } from "../pieces/waistband.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftWaistbandProduct(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const ctx = buildContext(
    { ...measurements, height: measurements.height || 4 },
    options
  );
  const piece = draftWaistband(ctx);
  return {
    productId: "cos",
    ctx,
    pieces: [piece],
    bounds: computeBounds([piece], ctx),
  };
}
