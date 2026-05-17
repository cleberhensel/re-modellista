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

export function segmentsToEditablePath(
  segments: PathSegment[],
  id: string,
  role: PathRole
): EditablePath | null {
  const solid = segments.filter((s) => !isDashed(s));
  if (solid.length === 0) return null;

  const nodes: EditablePath["nodes"] = [];
  const segmentKinds: SegmentKind[] = [];
  let closed = false;

  for (const seg of solid) {
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

export function dashedSegmentsToPath(
  segments: PathSegment[],
  id: string
): EditablePath | null {
  const dashed = segments.filter(isDashed);
  if (dashed.length === 0) return null;
  return segmentsToEditablePath(dashed, id, "guide");
}
