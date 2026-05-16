import { computeBounds } from "../bounds.js";
import { buildSkirtContext } from "../skirt-context.js";
import { draftSkirtBack } from "../pieces/skirt-back.js";
import { draftSkirtFront } from "../pieces/skirt-front.js";
import { draftWaistband } from "../pieces/waistband.js";
import { buildContext } from "../context.js";
import type {
  DraftOptions,
  DraftResult,
  Measurements,
  SkirtMeasurements,
} from "../types.js";

function asSkirt(m: Measurements): SkirtMeasurements {
  return {
    waist: m.waist,
    hip: m.hip ?? m.waist + 10,
    hipDepth: m.hipDepth ?? 20,
    skirtLength: m.skirtLength ?? 60,
  };
}

export function draftStraightSkirt(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const skirtM = asSkirt(measurements);
  const ctx = buildSkirtContext(skirtM, options);
  const pieces = [draftSkirtFront(ctx), draftSkirtBack(ctx)];
  if (options.includeWaistband) {
    const bodiceCtx = buildContext(
      { ...measurements, height: 4, bust: measurements.waist },
      options
    );
    pieces.push(draftWaistband(bodiceCtx));
  }
  return {
    productId: "saia-reta",
    ctx,
    pieces,
    bounds: computeBounds(pieces, ctx),
  };
}
