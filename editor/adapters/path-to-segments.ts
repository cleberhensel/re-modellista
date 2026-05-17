import type { PathSegment, Point2 } from "../../engine/types.js";
import type { EditablePath } from "../types.js";

function nodePoint(n: { x: number; y: number }): Point2 {
  return { x: n.x, y: n.y };
}

export function editablePathToSegments(path: EditablePath): PathSegment[] {
  const segments: PathSegment[] = [];
  const n = path.nodes.length;
  if (n === 0) return segments;

  const edgeCount = path.closed ? n : n - 1;
  if (edgeCount <= 0) return segments;

  segments.push({ type: "move", to: nodePoint(path.nodes[0]!) });

  for (let i = 0; i < edgeCount; i++) {
    const a = path.nodes[i]!;
    const b = path.nodes[(i + 1) % n]!;
    const kind = path.segmentKinds[i] ?? "line";
    if (kind === "cubic" && a.handleOut && b.handleIn) {
      segments.push({
        type: "cubic",
        from: nodePoint(a),
        cp1: a.handleOut,
        cp2: b.handleIn,
        to: nodePoint(b),
      });
    } else {
      segments.push({
        type: "line",
        from: nodePoint(a),
        to: nodePoint(b),
      });
    }
  }
  return segments;
}

export function piecePathsToPatternPiece(
  pieceId: string,
  paths: EditablePath[]
): { id: string; paths: PathSegment[] } {
  const all: PathSegment[] = [];
  for (const path of paths) {
    if (path.role === "guide") {
      const segs = editablePathToSegments(path);
      for (const s of segs) {
        if (s.type === "line") all.push({ ...s, dash: true });
        else if (s.type === "cubic") all.push({ ...s, dash: true });
        else all.push(s);
      }
    } else {
      all.push(...editablePathToSegments(path));
    }
  }
  return { id: pieceId, paths: all };
}
