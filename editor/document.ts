import { syncConstructionGuides } from "./construction/sync.js";
import { cubicPointAt } from "./geometry/bezier.js";
import type {
  EditablePath,
  PatternDocument,
  PathNode,
  Point2,
  SegmentKind,
} from "./types.js";

const POINT_EPS = 0.01;

let idCounter = 0;

export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}

export function createEmptyDocument(): PatternDocument {
  return {
    version: 1,
    unit: "cm",
    pieces: [],
    meta: {
      productId: "",
      generatedAt: new Date().toISOString(),
      seamAllowanceCm: 1,
      editState: "draft",
    },
    manualEditRevision: 0,
  };
}

export function cloneDocument(doc: PatternDocument): PatternDocument {
  return JSON.parse(JSON.stringify(doc)) as PatternDocument;
}

export function hasManualEdits(doc: PatternDocument): boolean {
  return doc.meta.editState === "dirty";
}

export function hasAppliedEdits(doc: PatternDocument): boolean {
  return doc.meta.editState === "applied";
}

export function shouldPreserveEditorDocument(doc: PatternDocument): boolean {
  return doc.meta.editState === "dirty" || doc.meta.editState === "applied";
}

export function applyManualEdits(doc: PatternDocument): void {
  doc.manualEditRevision = 0;
  doc.meta.editState = "applied";
  doc.meta.generatedAt = new Date().toISOString();
}

export function markDocumentDirty(doc: PatternDocument): void {
  doc.manualEditRevision += 1;
  doc.meta.editState = "dirty";
}

function bumpRevision(doc: PatternDocument): void {
  markDocumentDirty(doc);
}

export function getPiece(doc: PatternDocument, pieceId: string) {
  return doc.pieces.find((p) => p.id === pieceId);
}

export function getPath(piece: { paths: EditablePath[] }, pathId: string) {
  return piece.paths.find((p) => p.id === pathId);
}

export function getNode(path: EditablePath, nodeId: string) {
  return path.nodes.find((n) => n.id === nodeId);
}

function samePoint(a: Point2, b: Point2, eps = POINT_EPS): boolean {
  return Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps;
}

function edgeCount(path: EditablePath): number {
  if (path.nodes.length < 2) return 0;
  return path.closed ? path.nodes.length : path.nodes.length - 1;
}

function nodeAt(path: EditablePath, index: number): PathNode {
  const n = path.nodes.length;
  if (path.closed) {
    return path.nodes[((index % n) + n) % n]!;
  }
  return path.nodes[index]!;
}

function setSegmentKind(path: EditablePath, edgeIndex: number, kind: SegmentKind): void {
  while (path.segmentKinds.length < edgeCount(path)) {
    path.segmentKinds.push("line");
  }
  path.segmentKinds[edgeIndex] = kind;
}

export function moveNode(
  doc: PatternDocument,
  pieceId: string,
  pathId: string,
  nodeId: string,
  x: number,
  y: number
): boolean {
  const piece = getPiece(doc, pieceId);
  if (!piece) return false;
  const path = getPath(piece, pathId);
  if (!path) return false;
  const node = getNode(path, nodeId);
  if (!node) return false;
  const dx = x - node.x;
  const dy = y - node.y;
  node.x = x;
  node.y = y;
  if (node.handleIn) {
    node.handleIn = { x: node.handleIn.x + dx, y: node.handleIn.y + dy };
  }
  if (node.handleOut) {
    node.handleOut = { x: node.handleOut.x + dx, y: node.handleOut.y + dy };
  }
  if (path.role === "cut") {
    syncConstructionGuides(piece, pathId, nodeId);
  }
  bumpRevision(doc);
  return true;
}

export const moveNodeAbsolute = moveNode;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const MIN_INSERT_GAP_CM = 0.12;
const MIN_INSERT_GAP_FLOOR_CM = 0.025;

function edgeChordLength(path: EditablePath, edgeIndex: number): number {
  const a = nodeAt(path, edgeIndex);
  const b = nodeAt(path, edgeIndex + 1);
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function minInsertGapForEdge(path: EditablePath, edgeIndex: number): number {
  const chord = edgeChordLength(path, edgeIndex);
  return Math.min(MIN_INSERT_GAP_CM, Math.max(chord * 0.12, MIN_INSERT_GAP_FLOOR_CM));
}

export function pointOnEdgeAt(
  path: EditablePath,
  edgeIndex: number,
  t: number
): Point2 {
  const a = nodeAt(path, edgeIndex);
  const b = nodeAt(path, edgeIndex + 1);
  const kind = path.segmentKinds[edgeIndex] ?? "line";
  if (kind === "cubic" && a.handleOut && b.handleIn) {
    return cubicPointAt(a, a.handleOut, b.handleIn, b, t);
  }
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

export function canInsertOnEdge(
  path: EditablePath,
  edgeIndex: number,
  t: number
): boolean {
  if (edgeIndex < 0 || edgeIndex >= edgeCount(path) || t <= 0 || t >= 1) {
    return false;
  }
  const a = nodeAt(path, edgeIndex);
  const b = nodeAt(path, edgeIndex + 1);
  const gap = minInsertGapForEdge(path, edgeIndex);
  const pt = pointOnEdgeAt(path, edgeIndex, t);
  return (
    Math.hypot(pt.x - a.x, pt.y - a.y) >= gap &&
    Math.hypot(pt.x - b.x, pt.y - b.y) >= gap
  );
}

export function resolveInsertParam(
  path: EditablePath,
  edgeIndex: number,
  preferredT: number
): number | null {
  if (canInsertOnEdge(path, edgeIndex, preferredT)) return preferredT;
  const steps = 48;
  for (let i = 1; i <= steps; i++) {
    const delta = (i / steps) * 0.5;
    const left = preferredT - delta;
    const right = preferredT + delta;
    if (canInsertOnEdge(path, edgeIndex, left)) return left;
    if (canInsertOnEdge(path, edgeIndex, right)) return right;
  }
  return null;
}

export function insertNodeOnEdge(
  doc: PatternDocument,
  pieceId: string,
  pathId: string,
  edgeIndex: number,
  t: number
): string | null {
  const piece = getPiece(doc, pieceId);
  if (!piece) return null;
  const path = getPath(piece, pathId);
  if (!path) return null;
  const edges = edgeCount(path);
  if (edgeIndex < 0 || edgeIndex >= edges) return null;
  if (!canInsertOnEdge(path, edgeIndex, t)) return null;

  const a = nodeAt(path, edgeIndex);
  const b = nodeAt(path, edgeIndex + 1);
  const kind = path.segmentKinds[edgeIndex] ?? "line";
  const insertPoint = pointOnEdgeAt(path, edgeIndex, t);

  const newNode: PathNode = {
    id: nextId("n"),
    x: insertPoint.x,
    y: insertPoint.y,
  };

  if (kind === "cubic" && a.handleOut && b.handleIn) {
    const cp1 = a.handleOut;
    const cp2 = b.handleIn;
    const u = 1 - t;
    newNode.handleIn = {
      x: u * u * a.x + 2 * u * t * cp1.x + t * t * cp2.x,
      y: u * u * a.y + 2 * u * t * cp1.y + t * t * cp2.y,
    };
    newNode.handleOut = {
      x: u * u * cp1.x + 2 * u * t * cp2.x + t * t * b.x,
      y: u * u * cp1.y + 2 * u * t * cp2.y + t * t * b.y,
    };
  }

  const insertAt = edgeIndex + 1;
  path.nodes.splice(insertAt, 0, newNode);
  path.segmentKinds.splice(edgeIndex, 1, kind, kind);
  bumpRevision(doc);
  return newNode.id;
}

export function removeNode(
  doc: PatternDocument,
  pieceId: string,
  pathId: string,
  nodeId: string
): boolean {
  const piece = getPiece(doc, pieceId);
  if (!piece) return false;
  const path = getPath(piece, pathId);
  if (!path) return false;
  const idx = path.nodes.findIndex((n) => n.id === nodeId);
  if (idx < 0) return false;

  const minNodes = path.closed ? 3 : 2;
  if (path.nodes.length <= minNodes) return false;

  path.nodes.splice(idx, 1);
  if (path.segmentKinds.length > 0) {
    const removeKindAt = path.closed
      ? idx === 0
        ? path.segmentKinds.length - 1
        : idx - 1
      : Math.min(idx, path.segmentKinds.length - 1);
    if (removeKindAt >= 0 && removeKindAt < path.segmentKinds.length) {
      path.segmentKinds.splice(removeKindAt, 1);
    }
  }
  while (path.segmentKinds.length > edgeCount(path)) {
    path.segmentKinds.pop();
  }
  while (path.segmentKinds.length < edgeCount(path)) {
    path.segmentKinds.push("line");
  }
  bumpRevision(doc);
  return true;
}

export function movePieceLayout(
  doc: PatternDocument,
  pieceId: string,
  dx: number,
  dy: number
): boolean {
  const piece = getPiece(doc, pieceId);
  if (!piece) return false;
  piece.layout.x += dx;
  piece.layout.y += dy;
  piece.layoutManual = true;
  bumpRevision(doc);
  return true;
}

export function setNodeHandles(
  doc: PatternDocument,
  pieceId: string,
  pathId: string,
  nodeId: string,
  handleIn?: Point2,
  handleOut?: Point2
): boolean {
  const piece = getPiece(doc, pieceId);
  if (!piece) return false;
  const path = getPath(piece, pathId);
  if (!path) return false;
  const node = getNode(path, nodeId);
  if (!node) return false;
  if (handleIn !== undefined) node.handleIn = handleIn;
  if (handleOut !== undefined) node.handleOut = handleOut;
  bumpRevision(doc);
  return true;
}

export function documentBounds(doc: PatternDocument): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const piece of doc.pieces) {
    for (const path of piece.paths) {
      for (const node of path.nodes) {
        const wx = node.x + piece.layout.x;
        const wy = node.y + piece.layout.y;
        if (wx < minX) minX = wx;
        if (wy < minY) minY = wy;
        if (wx > maxX) maxX = wx;
        if (wy > maxY) maxY = wy;
        if (node.handleIn) {
          const hx = node.handleIn.x + piece.layout.x;
          const hy = node.handleIn.y + piece.layout.y;
          if (hx < minX) minX = hx;
          if (hy < minY) minY = hy;
          if (hx > maxX) maxX = hx;
          if (hy > maxY) maxY = hy;
        }
        if (node.handleOut) {
          const hx = node.handleOut.x + piece.layout.x;
          const hy = node.handleOut.y + piece.layout.y;
          if (hx < minX) minX = hx;
          if (hy < minY) minY = hy;
          if (hx > maxX) maxX = hx;
          if (hy > maxY) maxY = hy;
        }
      }
    }
  }
  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 400, maxY: 400 };
  }
  return { minX, minY, maxX, maxY };
}

export function pathWorldPoints(
  piece: { layout: { x: number; y: number } },
  path: EditablePath
): Point2[] {
  return path.nodes.map((n) => ({
    x: n.x + piece.layout.x,
    y: n.y + piece.layout.y,
  }));
}

export function pointsEqual(a: Point2, b: Point2): boolean {
  return samePoint(a, b);
}
