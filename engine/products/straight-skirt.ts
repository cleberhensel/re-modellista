import { composeGarment } from "../composition/compose.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftStraightSkirt(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  return composeGarment("saia-reta", measurements, options);
}
