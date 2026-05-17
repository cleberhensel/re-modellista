import type { Point2 } from "../../engine/types.js";
import type { EditablePath } from "../types.js";
import { pointOnHemEdge } from "./cut-geometry.js";

const CUBIC_STEPS = 24;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function cubicAt(
  p0: Point2,
  p1: Point2,
  p2: Point2,
  p3: Point2,
  t: number
): Point2 {
  const u = 1 - t;
  return {
    x:
      u * u * u * p0.x +
      3 * u * u * t * p1.x +
      3 * u * t * t * p2.x +
      t * t * t * p3.x,
    y:
      u * u * u * p0.y +
      3 * u * u * t * p1.y +
      3 * u * t * t * p2.y +
      t * t * t * p3.y,
  };
}

function intersectSegmentVertical(
  a: Point2,
  b: Point2,
  x0: number
): number | null {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  if (x0 < minX - 1e-6 || x0 > maxX + 1e-6) return null;
  if (Math.abs(b.x - a.x) < 1e-9) return null;
  const t = (x0 - a.x) / (b.x - a.x);
  if (t < -1e-6 || t > 1 + 1e-6) return null;
  return lerp(a.y, b.y, Math.max(0, Math.min(1, t)));
}

function collectVerticalHits(cut: EditablePath, x0: number): number[] {
  const hits: number[] = [];
  const n = cut.nodes.length;
  const edgeCount = cut.closed ? n : n - 1;

  for (let i = 0; i < edgeCount; i++) {
    const a = cut.nodes[i]!;
    const b = cut.nodes[(i + 1) % n]!;
    const kind = cut.segmentKinds[i] ?? "line";

    if (kind === "cubic" && a.handleOut && b.handleIn) {
      const p0 = { x: a.x, y: a.y };
      const p1 = a.handleOut;
      const p2 = b.handleIn;
      const p3 = { x: b.x, y: b.y };
      let prev = cubicAt(p0, p1, p2, p3, 0);
      for (let s = 1; s <= CUBIC_STEPS; s++) {
        const next = cubicAt(p0, p1, p2, p3, s / CUBIC_STEPS);
        const y = intersectSegmentVertical(prev, next, x0);
        if (y !== null) hits.push(y);
        prev = next;
      }
    } else {
      const y = intersectSegmentVertical(
        { x: a.x, y: a.y },
        { x: b.x, y: b.y },
        x0
      );
      if (y !== null) hits.push(y);
    }
  }

  return hits;
}

export function resolveGrainLine(
  cut: EditablePath,
  centerX: number,
  hemA: Point2,
  hemB: Point2
): { top: Point2; bottom: Point2 } | null {
  const hits = collectVerticalHits(cut, centerX);
  const bottomOnHem = pointOnHemEdge(hemA, hemB, centerX);

  if (hits.length === 0) {
    const topY = Math.min(...cut.nodes.map((nd) => nd.y));
    return {
      top: { x: centerX, y: topY },
      bottom: bottomOnHem,
    };
  }

  const topY = Math.min(...hits);

  return {
    top: { x: centerX, y: topY },
    bottom: bottomOnHem,
  };
}

export function resolveGrainCenterX(
  sideX: number,
  grainOffsetFromSide: number
): number {
  return sideX - grainOffsetFromSide;
}
