import type { DraftOptions, Measurements } from "../../engine/types.js";

export function buildRegenerateKey(
  productId: string,
  measurements: Measurements,
  options: DraftOptions
): string {
  return JSON.stringify({
    productId,
    measurements,
    includeSleeve: options.includeSleeve,
    includeCollar: options.includeCollar,
    includeCuff: options.includeCuff,
    includePlacket: options.includePlacket,
    includeChestPocket: options.includeChestPocket,
    includeSidePocket: options.includeSidePocket,
    includeWaistband: options.includeWaistband,
    sleevePreset: options.sleevePreset,
    fabricProfileId: options.fabricProfileId,
    legLengthCm: options.legLengthCm,
  });
}
