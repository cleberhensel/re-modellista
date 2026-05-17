import type { Point2 } from "../types.js";

export function segmentLength(a: Point2, b: Point2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function distanceBetween(a: Point2, b: Point2): number {
  return segmentLength(a, b);
}
