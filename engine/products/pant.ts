import { composeGarment } from "../composition/compose.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftPant(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  return composeGarment("calca", measurements, options);
}
