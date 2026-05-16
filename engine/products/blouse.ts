import { composeGarment } from "../composition/compose.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftBlouse(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  return composeGarment("blusa", measurements, options);
}
