import type { PathSegment, Point2 } from "../types.js";

function dist(a: Point2, b: Point2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function cubicAt(
  from: Point2,
  cp1: Point2,
  cp2: Point2,
  to: Point2,
  t: number
): Point2 {
  const u = 1 - t;
  return {
    x:
      u * u * u * from.x +
      3 * u * u * t * cp1.x +
      3 * u * t * t * cp2.x +
      t * t * t * to.x,
    y:
      u * u * u * from.y +
      3 * u * u * t * cp1.y +
      3 * u * t * t * cp2.y +
      t * t * t * to.y,
  };
}

function cubicLength(
  from: Point2,
  cp1: Point2,
  cp2: Point2,
  to: Point2,
  steps = 24
): number {
  let len = 0;
  let prev = from;
  for (let i = 1; i <= steps; i++) {
    const p = cubicAt(from, cp1, cp2, to, i / steps);
    len += dist(prev, p);
    prev = p;
  }
  return len;
}

export function pathLength(segments: PathSegment[]): number {
  let total = 0;
  let pen: Point2 | null = null;
  for (const seg of segments) {
    if (seg.type === "move") {
      pen = seg.to;
    } else if (seg.type === "line") {
      if (pen === null) {
        pen = seg.from;
      }
      total += dist(pen, seg.to);
      pen = seg.to;
    } else if (seg.type === "cubic") {
      if (pen === null) {
        pen = seg.from;
      }
      total += cubicLength(pen, seg.cp1, seg.cp2, seg.to);
      pen = seg.to;
    }
  }
  return total;
}
