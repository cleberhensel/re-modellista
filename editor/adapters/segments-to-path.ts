import type { PathSegment, Point2 } from "../../engine/types.js";
import type { EditablePath, PathRole, SegmentKind } from "../types.js";
import { nextId } from "../document.js";

const POINT_EPS = 0.001;

function samePoint(a: Point2, b: Point2): boolean {
  return Math.abs(a.x - b.x) < POINT_EPS && Math.abs(a.y - b.y) < POINT_EPS;
}

function addNode(
  nodes: EditablePath["nodes"],
  p: Point2,
  handleIn?: Point2,
  handleOut?: Point2
): void {
  const last = nodes[nodes.length - 1];
  if (last && samePoint(last, p)) {
    if (handleIn) last.handleIn = handleIn;
    if (handleOut) last.handleOut = handleOut;
    return;
  }
  nodes.push({
    id: nextId("n"),
    x: p.x,
    y: p.y,
    handleIn,
    handleOut,
  });
}

function isDashed(seg: PathSegment): boolean {
  return (seg.type === "line" || seg.type === "cubic") && !!seg.dash;
}

function segmentEnd(seg: PathSegment): Point2 {
  return seg.to;
}

export function splitSegmentChains(segments: PathSegment[]): PathSegment[][] {
  const chains: PathSegment[][] = [];
  let current: PathSegment[] = [];

  const flush = () => {
    if (current.length > 0) {
      chains.push(current);
      current = [];
    }
  };

  for (const seg of segments) {
    if (seg.type === "move") {
      flush();
      current = [seg];
      continue;
    }
    if (current.length === 0) {
      current.push({ type: "move", to: seg.from });
      current.push(seg);
      continue;
    }
    const prevEnd = segmentEnd(current[current.length - 1]!);
    if (!samePoint(prevEnd, seg.from)) {
      flush();
      current.push({ type: "move", to: seg.from });
    }
    current.push(seg);
  }
  flush();
  return chains;
}

export function segmentsToEditablePath(
  segments: PathSegment[],
  id: string,
  role: PathRole
): EditablePath | null {
  const drawable = segments.filter(
    (s) => s.type === "move" || s.type === "line" || s.type === "cubic"
  );
  if (drawable.length === 0) return null;

  const nodes: EditablePath["nodes"] = [];
  const segmentKinds: SegmentKind[] = [];
  let closed = false;

  for (const seg of drawable) {
    if (seg.type === "move") {
      addNode(nodes, seg.to);
    } else if (seg.type === "line") {
      if (nodes.length === 0) addNode(nodes, seg.from);
      const last = nodes[nodes.length - 1];
      if (last && !samePoint(last, seg.from)) addNode(nodes, seg.from);
      segmentKinds.push("line");
      addNode(nodes, seg.to);
    } else if (seg.type === "cubic") {
      if (nodes.length === 0) addNode(nodes, seg.from);
      const last = nodes[nodes.length - 1];
      if (last) last.handleOut = seg.cp1;
      segmentKinds.push("cubic");
      addNode(nodes, seg.to, seg.cp2);
    }
  }

  if (nodes.length >= 2) {
    const first = nodes[0]!;
    const last = nodes[nodes.length - 1]!;
    closed = samePoint(first, last);
    if (closed && nodes.length > 1) {
      nodes.pop();
      if (segmentKinds.length > 0) segmentKinds.pop();
    }
  }

  while (segmentKinds.length < (closed ? nodes.length : Math.max(0, nodes.length - 1))) {
    segmentKinds.push("line");
  }
  while (segmentKinds.length > (closed ? nodes.length : nodes.length - 1)) {
    segmentKinds.pop();
  }

  return {
    id,
    role,
    closed,
    nodes,
    segmentKinds,
  };
}

export function dashedSegmentsToPaths(
  segments: PathSegment[]
): EditablePath[] {
  const dashed = segments.filter(isDashed);
  if (dashed.length === 0) return [];
  const chains = splitSegmentChains(dashed);
  const paths: EditablePath[] = [];
  chains.forEach((chain, i) => {
    const path = segmentsToEditablePath(chain, `guide-${i}`, "guide");
    if (path) paths.push(path);
  });
  return paths;
}

export function dashedSegmentsToPath(
  segments: PathSegment[],
  id: string
): EditablePath | null {
  const paths = dashedSegmentsToPaths(segments);
  return paths[0] ?? null;
}

export function solidSegmentsToPaths(
  segments: PathSegment[]
): EditablePath[] {
  const solid = segments.filter((s) => !isDashed(s));
  if (solid.length === 0) return [];
  const chains = splitSegmentChains(solid);
  const paths: EditablePath[] = [];
  chains.forEach((chain, i) => {
    const path = segmentsToEditablePath(chain, `cut-${i}`, "cut");
    if (path) paths.push(path);
  });
  return paths;
}
