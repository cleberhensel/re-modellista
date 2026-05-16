export const EASE_BUST_BLOCK_CM = 5;
export const EASE_WAIST_BLOCK_CM = 3;
export const CAP_EASE_TARGET_MIN_CM = 3.2;
export const CAP_EASE_TARGET_MAX_CM = 4.4;
export const CROTCH_DEPTH_FALLBACK_A = 0.175;
export const CROTCH_DEPTH_FALLBACK_B_CM = 15.4;
export const SKIRT_HIP_HALF_EASE_CM = 1.5;
export const SKIRT_WAIST_FRONT_EASE_CM = 4.25;
export const SKIRT_WAIST_BACK_EASE_CM = 2.25;

export function crotchDepthFallbackCm(waist: number): number {
  return CROTCH_DEPTH_FALLBACK_A * waist + CROTCH_DEPTH_FALLBACK_B_CM;
}

export function capEaseTargetPx(k: number): number {
  return ((CAP_EASE_TARGET_MIN_CM + CAP_EASE_TARGET_MAX_CM) / 2) * k;
}
