import type { PathSegment, Point2 } from "../engine/types.js";

const MIN_INTERVAL_PX = 220;
const MAX_MARKERS_PER_LOOP = 5;
const MIN_LOOP_LENGTH_PX = 120;
const MIN_MARKER_SPACING_PX = 160;
const ICON_VIEW = 18;

export const CUT_MARKER_VIEW_OUTSET_PX = 14;

export interface CutMarkerSample {
  x: number;
  y: number;
  angleDeg: number;
}

function dist(a: Point2, b: Point2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function angleDeg(from: Point2, to: Point2): number {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

function chainLength(pts: Point2[], closed: boolean): number {
  let sum = 0;
  for (let i = 1; i < pts.length; i++) {
    sum += dist(pts[i - 1], pts[i]);
  }
  if (closed && pts.length >= 2) {
    sum += dist(pts[pts.length - 1], pts[0]);
  }
  return sum;
}

function chainsFromSegments(segments: PathSegment[]): Point2[][] {
  const chains: Point2[][] = [];
  let current: Point2[] = [];

  const flush = () => {
    if (current.length >= 2) {
      const closed =
        current.length >= 3 &&
        dist(current[0], current[current.length - 1]) < 0.5;
      if (closed) current.pop();
      chains.push(current);
    }
    current = [];
  };

  for (const seg of segments) {
    if (seg.type === "move") {
      flush();
      current.push(seg.to);
    } else if (seg.type === "line") {
      if (current.length === 0) {
        current.push(seg.from);
      } else if (dist(current[current.length - 1], seg.from) > 1e-4) {
        flush();
        current.push(seg.from);
      }
      current.push(seg.to);
    }
  }
  flush();
  return chains;
}

function sampleOpenChain(pts: Point2[], interval: number): CutMarkerSample[] {
  const len = chainLength(pts, false);
  if (len < MIN_LOOP_LENGTH_PX) return [];
  const out: CutMarkerSample[] = [];
  let carry = interval * 0.5;
  for (let i = 1; i < pts.length; i++) {
    carry = walkEdge(pts[i - 1], pts[i], interval, carry, out);
  }
  return dedupeSamples(out);
}

function sampleClosedChain(pts: Point2[], interval: number): CutMarkerSample[] {
  const n = pts.length;
  if (n < 3) return sampleOpenChain(pts, interval);
  const len = chainLength(pts, true);
  if (len < MIN_LOOP_LENGTH_PX) return [];
  const out: CutMarkerSample[] = [];
  let carry = interval * 0.5;
  for (let i = 0; i < n; i++) {
    const from = pts[i];
    const to = pts[(i + 1) % n];
    carry = walkEdge(from, to, interval, carry, out);
  }
  return dedupeSamples(out);
}

function walkEdge(
  from: Point2,
  to: Point2,
  interval: number,
  startOffset: number,
  out: CutMarkerSample[]
): number {
  const len = dist(from, to);
  if (len < 1e-6) return startOffset;
  let traveled = startOffset;
  while (traveled < len) {
    const t = traveled / len;
    out.push({
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
      angleDeg: angleDeg(from, to) + 45,
    });
    traveled += interval;
  }
  return traveled - len;
}

function dedupeSamples(samples: CutMarkerSample[]): CutMarkerSample[] {
  if (samples.length <= 1) return samples;
  const kept: CutMarkerSample[] = [samples[0]];
  for (let i = 1; i < samples.length; i++) {
    const prev = kept[kept.length - 1];
    const cur = samples[i];
    if (dist(prev, cur) >= MIN_MARKER_SPACING_PX) {
      kept.push(cur);
    }
  }
  return kept;
}

export function cutMarkerSamples(
  segments: PathSegment[],
  intervalPx = MIN_INTERVAL_PX
): CutMarkerSample[] {
  const chains = chainsFromSegments(segments);
  const out: CutMarkerSample[] = [];
  for (const pts of chains) {
    const len = chainLength(pts, true);
    const interval = Math.max(intervalPx, len / MAX_MARKERS_PER_LOOP);
    const samples =
      pts.length >= 3
        ? sampleClosedChain(pts, interval)
        : sampleOpenChain(pts, interval);
    out.push(...samples);
  }
  return dedupeSamples(out);
}

export function scissorsIconMarkup(
  sample: CutMarkerSample,
  forPrint = false
): string {
  const fill = forPrint ? "#000" : "#18181b";
  const s = (ICON_VIEW / 20).toFixed(3);
  return `<g class="cut-marker" transform="translate(${sample.x.toFixed(2)},${sample.y.toFixed(2)}) rotate(${sample.angleDeg.toFixed(2)}) scale(${s})" fill="${fill}"><path d="M-5.5-8.5a3.1 3.1 0 1 1 0 6.2 3.1 3.1 0 0 1 0-6.2zm0 10.8a3.1 3.1 0 1 1 0 6.2 3.1 3.1 0 0 1 0-6.2zM-.4-1.8 11.2 9.8M-.4-1.8 11.2-12.6M-.4-1.8-12 9.8M-.4-1.8-12-12.6" fill="none" stroke="${fill}" stroke-width="1.7" stroke-linecap="round"/></g>`;
}

export function cutMarkersSvg(
  segments: PathSegment[],
  forPrint = false,
  intervalPx = MIN_INTERVAL_PX
): string {
  const samples = cutMarkerSamples(segments, intervalPx);
  if (samples.length === 0) return "";
  return samples.map((s) => scissorsIconMarkup(s, forPrint)).join("\n");
}
