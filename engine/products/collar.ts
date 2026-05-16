import { buildContext } from "../context.js";
import { computeBounds } from "../bounds.js";
import { draftCollarFall, draftCollarStand } from "../pieces/collar.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftCollarProduct(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const ctx = buildContext(measurements, options);
  const pieces = [draftCollarStand(ctx), draftCollarFall(ctx)];
  return {
    productId: "colarinho",
    ctx,
    pieces,
    bounds: computeBounds(pieces, ctx),
  };
}
