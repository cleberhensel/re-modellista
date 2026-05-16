import { draftBlouse } from "./blouse.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftSleevelessTop(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const result = draftBlouse(measurements, {
    ...options,
    sleeveless: true,
    armholeDepthOffsetCm: options.armholeDepthOffsetCm ?? 2,
    productId: "top-sem-mangas",
  });
  return { ...result, productId: "top-sem-mangas" };
}
