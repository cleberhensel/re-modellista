import { point } from "./geometry.js";
import type { Point2 } from "./types.js";

export interface SleeveVertex {
  point: Point2;
  handleIn: Point2;
  handleOut: Point2;
}

function vector(from: Point2, to: Point2): Point2 {
  return point(to.x - from.x, to.y - from.y);
}

function length(v: Point2): number {
  return Math.hypot(v.x, v.y);
}

function scaleTo(v: Point2, len: number): Point2 {
  const l = length(v);
  if (l < 1e-9) {
    return point(0, 0);
  }
  return point((v.x / l) * len, (v.y / l) * len);
}

function maxHandle(prev: Point2, curr: Point2, next: Point2): number {
  return Math.min(length(vector(prev, curr)), length(vector(curr, next)));
}

function atOrigin(p: Point2): boolean {
  return p.x === 0 && p.y === 0;
}

export function addSleeveHandle(
  vertices: SleeveVertex[],
  index: number
): SleeveVertex {
  const segment = vertices[index];
  const prev = vertices[index - 1];
  const next = vertices[index + 1];
  let handle: Point2;

  if (index === 0) {
    const vNext = vector(segment.point, next.point);
    const vNextNext = vector(next.point, vertices[index + 2].point);
    const handleOut = point(vNext.x + vNextNext.x, vNext.y + vNextNext.y);
    handle = scaleTo(handleOut, length(vNext) / 2);
  } else if (index === vertices.length - 1) {
    const vPrev = vector(segment.point, prev.point);
    const vPrevPrev = vector(prev.point, vertices[index - 2].point);
    const handleIn = point(vPrev.x + vPrevPrev.x, vPrev.y + vPrevPrev.y);
    handle = scaleTo(handleIn, length(vPrev) / 2);
  } else {
    const maxSize = maxHandle(prev.point, segment.point, next.point);
    const vPrev = vector(prev.point, segment.point);
    const vNext = vector(segment.point, next.point);
    if (prev.point.y === next.point.y) {
      const midX = (prev.point.x + segment.point.x) / 2;
      const topCenter = point(midX, segment.point.y);
      const dir = point(
        (topCenter.x - segment.point.x) * -1,
        (topCenter.y - segment.point.y) * -1
      );
      handle = scaleTo(dir, maxSize / 1.7);
    } else if (
      !atOrigin(prev.handleOut) ||
      !atOrigin(next.handleIn)
    ) {
      const handleIn = vector(
        point(prev.handleOut.x + prev.point.x, prev.handleOut.y + prev.point.y),
        segment.point
      );
      const handleOut = vector(
        segment.point,
        point(next.handleIn.x + next.point.x, next.handleIn.y + next.point.y)
      );
      const sum = point(handleIn.x + handleOut.x, handleIn.y + handleOut.y);
      handle = scaleTo(sum, maxSize / 3);
    } else {
      const sum = point(vPrev.x + vNext.x, vPrev.y + vNext.y);
      handle = scaleTo(sum, maxSize / 2.5);
    }
  }

  return {
    point: segment.point,
    handleIn: point(handle.x * -1, handle.y * -1),
    handleOut: handle,
  };
}

export function applySleeveHandles(vertices: SleeveVertex[]): SleeveVertex[] {
  const order = [4, 0, 1, 3, 2, 7, 5, 6];
  let current = vertices.map((v) => ({
    point: v.point,
    handleIn: point(0, 0),
    handleOut: point(0, 0),
  }));
  for (const idx of order) {
    current[idx] = addSleeveHandle(current, idx);
  }
  return current;
}
