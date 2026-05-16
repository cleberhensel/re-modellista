import { buildContext } from "../context.js";
import {
  CAP_EASE_TARGET_MAX_CM,
  CAP_EASE_TARGET_MIN_CM,
} from "../ease.js";
import { draftSleevePiece } from "../pieces/sleeve.js";
import { blouseGuardrails } from "./blouse.js";
import type { DraftOptions, Measurements, PieceGuardrails } from "./types.js";

function capEaseCm(measurements: Measurements, options: DraftOptions): number | null {
  const ctx = buildContext(measurements, options);
  const sleeve = draftSleevePiece(ctx);
  const capEase = sleeve.points?.capEase as number | undefined;
  if (capEase == null) return null;
  const k = options.pxPerCm ?? ctx.k;
  return capEase / k;
}

export const shirtGuardrails: PieceGuardrails = {
  ...blouseGuardrails,
  pieceId: "camisa",
  resolve(measurements, changed, options = {}) {
    const resolved = blouseGuardrails.resolve(measurements, changed, options);
    if (
      options.includeSleeve === false ||
      options.sleeveless
    ) {
      return resolved;
    }
    const ease = capEaseCm(resolved, options);
    if (
      ease != null &&
      (ease < CAP_EASE_TARGET_MIN_CM || ease > CAP_EASE_TARGET_MAX_CM)
    ) {
      return resolved;
    }
    return resolved;
  },
};
