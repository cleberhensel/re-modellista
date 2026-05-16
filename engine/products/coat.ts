import { composeGarment } from "../composition/compose.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftCoat(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  return composeGarment("casaco", measurements, options);
}
