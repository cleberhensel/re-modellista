import { composeGarment } from "../composition/compose.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftSleevelessTop(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  return composeGarment("top-sem-mangas", measurements, options);
}
