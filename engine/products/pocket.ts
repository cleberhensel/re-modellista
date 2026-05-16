import { buildContext } from "../context.js";
import { computeBounds } from "../bounds.js";
import { draftChestPocket } from "../pieces/pocket.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftPocketProduct(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const ctx = buildContext(measurements, options);
  const piece = draftChestPocket(ctx);
  const pieces = piece.error ? [] : [piece];
  return {
    productId: "bolso-peito",
    ctx,
    pieces,
    bounds: computeBounds(pieces.length ? pieces : [{ id: "x", paths: [] }], ctx),
  };
}
