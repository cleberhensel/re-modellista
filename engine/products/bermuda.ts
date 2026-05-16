import { composeGarment } from "../composition/compose.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftBermuda(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  return composeGarment("bermuda", measurements, options);
}
