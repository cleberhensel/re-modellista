import type { EditablePath } from "./types.js";

function edgeCount(path: EditablePath): number {
  if (path.nodes.length < 2) return 0;
  return path.closed ? path.nodes.length : path.nodes.length - 1;
}

function nodeAt(path: EditablePath, index: number) {
  const n = path.nodes.length;
  return path.nodes[path.closed ? ((index % n) + n) % n : index]!;
}

function defaultHandleAlong(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): { x: number; y: number } | null {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return null;
  const k = len / 3;
  return { x: fromX + (dx / len) * k, y: fromY + (dy / len) * k };
}

export function ensureCubicPairHandles(
  path: EditablePath,
  nodeIndex: number,
  handle: "in" | "out"
): void {
  const n = path.nodes.length;
  if (n < 2) return;
  const node = nodeAt(path, nodeIndex);

  if (handle === "in") {
    const prevIdx = path.closed ? (nodeIndex - 1 + n) % n : nodeIndex - 1;
    if (!path.closed && prevIdx < 0) return;
    const prev = nodeAt(path, prevIdx);
    if (!prev.handleOut) {
      const pt = defaultHandleAlong(prev.x, prev.y, node.x, node.y);
      if (pt) prev.handleOut = pt;
    }
    if (!node.handleIn) {
      const pt = defaultHandleAlong(node.x, node.y, prev.x, prev.y);
      if (pt) node.handleIn = pt;
    }
  }

  if (handle === "out") {
    const nextIdx = path.closed ? (nodeIndex + 1) % n : nodeIndex + 1;
    if (!path.closed && nextIdx >= n) return;
    const next = nodeAt(path, nextIdx);
    if (!node.handleOut) {
      const pt = defaultHandleAlong(node.x, node.y, next.x, next.y);
      if (pt) node.handleOut = pt;
    }
    if (!next.handleIn) {
      const pt = defaultHandleAlong(next.x, next.y, node.x, node.y);
      if (pt) next.handleIn = pt;
    }
  }
}

export function ensureNodeHandles(path: EditablePath, nodeIndex: number): void {
  ensureCubicPairHandles(path, nodeIndex, "in");
  ensureCubicPairHandles(path, nodeIndex, "out");
}

export function markCubicForHandle(
  path: EditablePath,
  nodeIndex: number,
  handle: "in" | "out"
): void {
  ensureCubicPairHandles(path, nodeIndex, handle);
  const edges = edgeCount(path);
  while (path.segmentKinds.length < edges) {
    path.segmentKinds.push("line");
  }
  const n = path.nodes.length;
  if (handle === "out" && nodeIndex < edges) {
    path.segmentKinds[nodeIndex] = "cubic";
  }
  if (handle === "in") {
    const prevEdge = path.closed
      ? (nodeIndex - 1 + n) % n
      : nodeIndex - 1;
    if (prevEdge >= 0 && prevEdge < edges) {
      path.segmentKinds[prevEdge] = "cubic";
    }
  }
}
