import { applyFabricProfile, getFabricProfile } from "../fabric.js";
import { draftBlouse } from "./blouse.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftKnit(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const profile = getFabricProfile(options.fabricProfileId ?? "knit-light");
  const adjusted = applyFabricProfile(measurements, profile);
  const result = draftBlouse(adjusted, {
    ...options,
    suppressDarts: profile.suppressDarts,
    productId: "malha",
  });
  return { ...result, productId: "malha" };
}
