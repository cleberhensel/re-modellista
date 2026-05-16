import type { PathSegment, Point2 } from "./types.js";

export function point(x: number, y: number): Point2 {
  return { x, y };
}

export function add(a: Point2, b: Point2): Point2 {
  return point(a.x + b.x, a.y + b.y);
}

export function lineIntersection(
  a1: Point2,
  a2: Point2,
  b1: Point2,
  b2: Point2
): Point2 | null {
  const x1 = a1.x;
  const y1 = a1.y;
  const x2 = a2.x;
  const y2 = a2.y;
  const x3 = b1.x;
  const y3 = b1.y;
  const x4 = b2.x;
  const y4 = b2.y;
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-9) {
    return null;
  }
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  return point(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
}

export function cubicSegment(
  from: Point2,
  cp1: Point2,
  cp2: Point2,
  to: Point2
): PathSegment {
  return { type: "cubic", from, cp1, cp2, to };
}

export function lineSegment(
  from: Point2,
  to: Point2,
  dash = false
): PathSegment {
  return { type: "line", from, to, dash };
}

export function moveTo(to: Point2): PathSegment {
  return { type: "move", to };
}
