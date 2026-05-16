import { computeBounds } from "./bounds.js";
import { draftProduct } from "./registry.js";
import type {
  DraftBounds,
  DraftContext,
  DraftOptions,
  DraftResult,
  Measurements,
  PathSegment,
  PatternPiece,
  Point2,
} from "./types.js";

export { buildContext } from "./context.js";
export { computeBounds } from "./bounds.js";
export { DEFAULT_MARGIN_CM, DEFAULT_PX_PER_CM } from "./constants.js";
export {
  getGuardrails,
  resolveMeasurements,
  isBlouseStable,
} from "./guardrails/index.js";
export {
  draftProduct,
  listRegisteredProducts,
  registerProduct,
} from "./registry.js";
export { seventhFromBustCm, seventhToPx } from "./seventh.js";
export type {
  BodiceMeasurements,
  DraftContext,
  DraftOptions,
  DraftResult,
  DressMeasurements,
  Measurements,
  PantMeasurements,
  PathSegment,
  PatternPiece,
  Point2,
  SkirtMeasurements,
} from "./types.js";

export function draft(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const productId = options.productId ?? "blusa";
  return draftProduct(productId, measurements, options);
}
