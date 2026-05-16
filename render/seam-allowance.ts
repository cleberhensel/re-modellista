import { DEFAULT_PX_PER_CM } from "../engine/constants.js";
import { lineIntersection, point } from "../engine/geometry.js";
import type { PathSegment, Point2 } from "../engine/types.js";

export const DEFAULT_SEAM_ALLOWANCE_CM = 1;
export const SEAM_ALLOWANCE_DASH = true;

function dist(a: Point2, b: Point2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function sub(a: Point2, b: Point2): Point2 {
  return point(a.x - b.x, a.y - b.y);
}

function addPts(a: Point2, b: Point2): Point2 {
  return point(a.x + b.x, a.y + b.y);
}

function scale(v: Point2, s: number): Point2 {
  return point(v.x * s, v.y * s);
}

function normalize(v: Point2): Point2 {
  const len = Math.hypot(v.x, v.y);
  if (len < 1e-9) return point(0, 0);
  return point(v.x / len, v.y / len);
}

function signedArea(pts: Point2[]): number {
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum / 2;
}

function cubicAt(
  from: Point2,
  cp1: Point2,
  cp2: Point2,
  to: Point2,
  t: number
): Point2 {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  const uuu = uu * u;
  const ttt = tt * t;
  return point(
    uuu * from.x + 3 * uu * t * cp1.x + 3 * u * tt * cp2.x + ttt * to.x,
    uuu * from.y + 3 * uu * t * cp1.y + 3 * u * tt * cp2.y + ttt * to.y
  );
}

function flattenSolidSegments(
  segments: PathSegment[],
  stepsPerCubic = 8
): Point2[][] {
  const chains: Point2[][] = [];
  let current: Point2[] = [];

  const pushChain = () => {
    if (current.length >= 2) {
      chains.push(current);
    }
    current = [];
  };

  for (const seg of segments) {
    if (seg.type === "move") {
      pushChain();
      current.push(seg.to);
    } else if (seg.type === "line") {
      if (current.length === 0) {
        current.push(seg.from);
      } else if (dist(current[current.length - 1], seg.from) > 1e-4) {
        current.push(seg.from);
      }
      current.push(seg.to);
    } else if (seg.type === "cubic") {
      if (current.length === 0) {
        current.push(seg.from);
      } else if (dist(current[current.length - 1], seg.from) > 1e-4) {
        current.push(seg.from);
      }
      for (let i = 1; i <= stepsPerCubic; i++) {
        current.push(cubicAt(seg.from, seg.cp1, seg.cp2, seg.to, i / stepsPerCubic));
      }
    }
  }
  pushChain();
  return chains;
}

function outwardSign(pts: Point2[]): number {
  if (pts.length < 3) return 1;
  const area = signedArea(pts);
  return area >= 0 ? 1 : -1;
}

function leftNormal(v: Point2): Point2 {
  return point(-v.y, v.x);
}

function rightNormal(v: Point2): Point2 {
  return point(v.y, -v.x);
}

function edgeNormal(from: Point2, to: Point2, sign: number): Point2 {
  const dir = normalize(sub(to, from));
  return sign > 0 ? rightNormal(dir) : leftNormal(dir);
}

function miterVertex(
  prev: Point2,
  curr: Point2,
  next: Point2,
  distance: number,
  sign: number
): Point2 {
  const n1 = edgeNormal(prev, curr, sign);
  const n2 = edgeNormal(curr, next, sign);
  const p1 = addPts(prev, scale(n1, distance));
  const p2 = addPts(curr, scale(n1, distance));
  const p3 = addPts(curr, scale(n2, distance));
  const p4 = addPts(next, scale(n2, distance));
  const hit = lineIntersection(p1, p2, p3, p4);
  if (hit) return hit;
  const bisector = normalize(addPts(n1, n2));
  const len = Math.hypot(bisector.x, bisector.y);
  if (len < 1e-9) {
    return addPts(curr, scale(n1, distance));
  }
  const miterLen = distance / Math.max(0.35, Math.abs(bisector.x * n1.x + bisector.y * n1.y));
  return addPts(curr, scale(bisector, miterLen));
}

function offsetOpenChain(pts: Point2[], distance: number, sign: number): Point2[] {
  const n = pts.length;
  if (n < 2) return [];
  const out: Point2[] = [];
  for (let i = 0; i < n; i++) {
    if (i === 0) {
      const n0 = edgeNormal(pts[0], pts[1], sign);
      out.push(addPts(pts[0], scale(n0, distance)));
    } else if (i === n - 1) {
      const nn = edgeNormal(pts[n - 2], pts[n - 1], sign);
      out.push(addPts(pts[n - 1], scale(nn, distance)));
    } else {
      out.push(miterVertex(pts[i - 1], pts[i], pts[i + 1], distance, sign));
    }
  }
  return out;
}

function offsetClosedChain(pts: Point2[], distance: number, sign: number): Point2[] {
  const n = pts.length;
  if (n < 3) return offsetOpenChain(pts, distance, sign);
  const out: Point2[] = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    out.push(miterVertex(prev, curr, next, distance, sign));
  }
  return out;
}

function chainToPathSegments(pts: Point2[]): PathSegment[] {
  if (pts.length < 2) return [];
  const segments: PathSegment[] = [{ type: "move", to: pts[0] }];
  for (let i = 1; i < pts.length; i++) {
    segments.push({
      type: "line",
      from: pts[i - 1],
      to: pts[i],
      dash: SEAM_ALLOWANCE_DASH,
    });
  }
  return segments;
}

function isNearlyClosed(pts: Point2[], epsilon = 0.5): boolean {
  if (pts.length < 3) return false;
  return dist(pts[0], pts[pts.length - 1]) < epsilon;
}

export function seamAllowanceSegments(
  solidSegments: PathSegment[],
  allowanceCm = DEFAULT_SEAM_ALLOWANCE_CM,
  pxPerCm = DEFAULT_PX_PER_CM
): PathSegment[] {
  const distance = allowanceCm * pxPerCm;
  if (distance <= 0 || solidSegments.length === 0) {
    return [];
  }

  const chains = flattenSolidSegments(solidSegments);
  const result: PathSegment[] = [];

  for (let raw of chains) {
    if (raw.length < 2) continue;
    const closed = isNearlyClosed(raw);
    if (closed && dist(raw[0], raw[raw.length - 1]) > 1e-6) {
      raw = raw.slice(0, -1);
    }
    const sign = outwardSign(closed ? raw : raw);
    const offset = closed
      ? offsetClosedChain(raw, distance, sign)
      : offsetOpenChain(raw, distance, sign);
    const path = chainToPathSegments(offset);
    if (closed && offset.length >= 2) {
      path.push({
        type: "line",
        from: offset[offset.length - 1],
        to: offset[0],
        dash: SEAM_ALLOWANCE_DASH,
      });
    }
    result.push(...path);
  }

  return result;
}

export function seamAllowancePaddingPx(
  allowanceCm = DEFAULT_SEAM_ALLOWANCE_CM,
  pxPerCm = DEFAULT_PX_PER_CM
): number {
  return Math.max(0, allowanceCm * pxPerCm);
}
