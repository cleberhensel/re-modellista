import { draftBlouse } from "./blouse.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftSleevelessTop(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const result = draftBlouse(measurements, {
    ...options,
    sleeveless: true,
    productId: "top-sem-mangas",
  });
  return { ...result, productId: "top-sem-mangas" };
}
