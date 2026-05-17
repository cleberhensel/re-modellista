import type { PatternDocument, Point2 } from "../types.js";
import type { EditablePath } from "../types.js";
import { getPiece, getPath } from "../document.js";

const NODE_RADIUS_PX = 8;

export interface PickNodeResult {
  pieceId: string;
  pathId: string;
  nodeId: string;
}

export interface PickEdgeResult {
  pieceId: string;
  pathId: string;
  edgeIndex: number;
  t: number;
}

function dist(a: Point2, b: Point2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function worldNode(piece: { layout: { x: number; y: number } }, n: { x: number; y: number }): Point2 {
  return { x: n.x + piece.layout.x, y: n.y + piece.layout.y };
}

function edgeCount(path: EditablePath): number {
  if (path.nodes.length < 2) return 0;
  return path.closed ? path.nodes.length : path.nodes.length - 1;
}

function nodeAt(path: EditablePath, i: number) {
  const n = path.nodes.length;
  return path.nodes[path.closed ? ((i % n) + n) % n : i]!;
}

function projectOnSegment(a: Point2, b: Point2, p: Point2): { t: number; dist: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-12) return { t: 0, dist: dist(a, p) };
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: a.x + t * dx, y: a.y + t * dy };
  return { t, dist: dist(proj, p) };
}

function pointInPolygon(points: Point2[], p: Point2): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i]!.x;
    const yi = points[i]!.y;
    const xj = points[j]!.x;
    const yj = points[j]!.y;
    const intersect =
      yi > p.y !== yj > p.y &&
      p.x < ((xj - xi) * (p.y - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function pickNode(
  doc: PatternDocument,
  world: Point2,
  scale: number
): PickNodeResult | null {
  const threshold = NODE_RADIUS_PX / scale;
  let best: { result: PickNodeResult; d: number } | null = null;
  for (const piece of doc.pieces) {
    for (const path of piece.paths) {
      if (path.role !== "cut" && path.role !== "fold") continue;
      for (const node of path.nodes) {
        const w = worldNode(piece, node);
        const d = dist(w, world);
        if (d <= threshold && (!best || d < best.d)) {
          best = {
            d,
            result: {
              pieceId: piece.id,
              pathId: path.id,
              nodeId: node.id,
            },
          };
        }
      }
    }
  }
  return best?.result ?? null;
}

export function pickEdge(
  doc: PatternDocument,
  world: Point2,
  scale: number
): PickEdgeResult | null {
  const threshold = 6 / scale;
  let best: { result: PickEdgeResult; d: number } | null = null;
  for (const piece of doc.pieces) {
    for (const path of piece.paths) {
      if (path.role !== "cut" && path.role !== "fold") continue;
      const edges = edgeCount(path);
      for (let i = 0; i < edges; i++) {
        const a = worldNode(piece, nodeAt(path, i));
        const b = worldNode(piece, nodeAt(path, i + 1));
        const { t, dist: d } = projectOnSegment(a, b, world);
        if (d <= threshold && (!best || d < best.d)) {
          best = {
            d,
            result: {
              pieceId: piece.id,
              pathId: path.id,
              edgeIndex: i,
              t,
            },
          };
        }
      }
    }
  }
  return best?.result ?? null;
}

export function pickPiece(
  doc: PatternDocument,
  world: Point2
): string | null {
  for (const piece of doc.pieces) {
    const cut = piece.paths.find((p) => p.role === "cut");
    if (!cut || cut.nodes.length < 3) continue;
    const poly = cut.nodes.map((n) => worldNode(piece, n));
    if (pointInPolygon(poly, world)) return piece.id;
  }
  return null;
}

export function pick(
  doc: PatternDocument,
  world: Point2,
  scale: number
): PickNodeResult | PickEdgeResult | { pieceId: string } | null {
  const node = pickNode(doc, world, scale);
  if (node) return node;
  const edge = pickEdge(doc, world, scale);
  if (edge) return edge;
  const pieceId = pickPiece(doc, world);
  if (pieceId) return { pieceId };
  return null;
}
