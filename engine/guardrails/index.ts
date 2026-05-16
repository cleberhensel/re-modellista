import { blouseFrontGuardrails } from "./blouse-front.js";
import type { DraftOptions, Measurements } from "../types.js";
import type { MeasurementKey, PieceGuardrails } from "./types.js";

export type { FieldRange, FieldSpec, MeasurementKey, PieceGuardrails } from "./types.js";
export {
  dartClearsArmhole,
  isBlouseFrontStable,
  shoulderIntersects,
} from "./checks.js";
export { blouseFrontGuardrails, blouseFrontStability } from "./blouse-front.js";

const REGISTRY: Record<string, PieceGuardrails> = {
  "blouse-front": blouseFrontGuardrails,
};

export function getGuardrails(pieceId: string): PieceGuardrails {
  const g = REGISTRY[pieceId];
  if (!g) {
    throw new Error(`no guardrails for piece: ${pieceId}`);
  }
  return g;
}

export function resolveMeasurements(
  pieceId: string,
  measurements: Measurements,
  changed: MeasurementKey,
  options?: DraftOptions
): Measurements {
  return getGuardrails(pieceId).resolve(measurements, changed, options);
}
