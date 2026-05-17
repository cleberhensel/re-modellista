import type { Point2 } from "../types.js";

function dist(a: Point2, b: Point2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function cubicPointAt(
  a: Point2,
  c1: Point2,
  c2: Point2,
  b: Point2,
  t: number
): Point2 {
  const u = 1 - t;
  const uu = u * u;
  const uuu = uu * u;
  const tt = t * t;
  const ttt = tt * t;
  return {
    x: uuu * a.x + 3 * uu * t * c1.x + 3 * u * tt * c2.x + ttt * b.x,
    y: uuu * a.y + 3 * uu * t * c1.y + 3 * u * tt * c2.y + ttt * b.y,
  };
}

export function projectOnCubic(
  a: Point2,
  c1: Point2,
  c2: Point2,
  b: Point2,
  p: Point2
): { t: number; dist: number } {
  const samples = 32;
  let bestT = 0;
  let bestD = Infinity;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const d = dist(cubicPointAt(a, c1, c2, b, t), p);
    if (d < bestD) {
      bestD = d;
      bestT = t;
    }
  }
  let step = 1 / samples;
  for (let refine = 0; refine < 5; refine++) {
    step *= 0.5;
    for (const offset of [-step, step]) {
      const t = Math.max(0, Math.min(1, bestT + offset));
      const d = dist(cubicPointAt(a, c1, c2, b, t), p);
      if (d < bestD) {
        bestD = d;
        bestT = t;
      }
    }
  }
  return { t: bestT, dist: bestD };
}
