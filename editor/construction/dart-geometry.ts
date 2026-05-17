import type { PathSegment, Point2 } from "../../engine/types.js";

const PT_EPS = 0.08;

export interface ParsedDart {
  apex: Point2;
  hemCenter: Point2;
  spread: number;
}

function nearPt(a: Point2, b: Point2): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) < PT_EPS;
}

function dashedLines(paths: PathSegment[]): Array<Extract<PathSegment, { type: "line" }>> {
  return paths.filter(
    (s): s is Extract<PathSegment, { type: "line" }> =>
      s.type === "line" && !!s.dash
  );
}

function otherEnd(
  seg: Extract<PathSegment, { type: "line" }>,
  apex: Point2
): Point2 {
  return nearPt(seg.from, apex) ? seg.to : seg.from;
}

function legsFromApex(
  apex: Point2,
  lines: Array<Extract<PathSegment, { type: "line" }>>
): Array<Extract<PathSegment, { type: "line" }>> {
  return lines.filter((s) => nearPt(s.from, apex));
}

function parseLegCluster(
  apex: Point2,
  legs: Array<Extract<PathSegment, { type: "line" }>>,
  minLegs: number
): ParsedDart | null {
  if (legs.length < minLegs) return null;
  const hemPts = legs.map((s) => s.to);
  const hemY = Math.max(...hemPts.map((p) => p.y));
  const onHem = hemPts.filter((p) => Math.abs(p.y - hemY) < PT_EPS * 2);
  if (onHem.length < minLegs) return null;
  const center = onHem.find((p) => Math.abs(p.x - apex.x) < PT_EPS);
  const spread = Math.max(0, ...onHem.map((p) => Math.abs(p.x - apex.x)));
  if (!center || spread <= PT_EPS) return null;
  return { apex, hemCenter: center, spread };
}

export function parseDartFromDashed(
  paths: PathSegment[]
): ParsedDart | null {
  const lines = dashedLines(paths);
  const seen = new Set<string>();

  for (const seg of lines) {
    const apex = seg.from;
    const key = `${apex.x.toFixed(3)}|${apex.y.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const legs = legsFromApex(apex, lines);
    const parsed =
      parseLegCluster(apex, legs, 3) ?? parseLegCluster(apex, legs, 2);
    if (parsed) return parsed;
  }

  return null;
}

export function extractGrainX(
  paths: PathSegment[],
  grainHit?: Point2 | null
): number {
  const lines = dashedLines(paths);
  for (const seg of lines) {
    const dy = Math.abs(seg.to.y - seg.from.y);
    const dx = Math.abs(seg.to.x - seg.from.x);
    if (dy > dx && dx < 0.01) {
      const low = seg.from.y < seg.to.y ? seg.from : seg.to;
      const high = seg.from.y < seg.to.y ? seg.to : seg.from;
      if (high.y - low.y > 1 && low.y > 0) {
        return high.x;
      }
    }
  }
  if (grainHit) return grainHit.x;
  return 0;
}
