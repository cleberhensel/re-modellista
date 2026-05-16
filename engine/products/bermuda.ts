import { computeBounds } from "../bounds.js";
import { buildPantContext } from "../pant-context.js";
import { draftPantBack } from "../pieces/pant-back.js";
import { draftPantFront } from "../pieces/pant-front.js";
import type {
  DraftOptions,
  DraftResult,
  Measurements,
  PantMeasurements,
} from "../types.js";

const BERMUDA_LEG_CM = 45;

function asPant(m: Measurements): PantMeasurements {
  return {
    waist: m.waist,
    hip: m.hip ?? m.waist + 12,
    crotchDepth: m.crotchDepth ?? 26,
    inseam: m.inseam ?? 78,
  };
}

export function draftBermuda(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const pantM = asPant(measurements);
  const legLengthCm = options.legLengthCm ?? BERMUDA_LEG_CM;
  const ctx = buildPantContext(pantM, { ...options, legLengthCm });
  const pieces = [draftPantFront(ctx), draftPantBack(ctx)];
  return {
    productId: "bermuda",
    ctx,
    pieces,
    bounds: computeBounds(pieces, ctx),
  };
}
