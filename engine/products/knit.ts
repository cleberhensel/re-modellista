import { composeGarment } from "../composition/compose.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftKnit(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  return composeGarment("malha", measurements, options);
}
