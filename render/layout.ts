import type { DraftBounds, PathSegment, PatternPiece, Point2 } from "../engine/types.js";

export interface PieceBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

function collectPoints(seg: PathSegment): Point2[] {
  if (seg.type === "move") return [seg.to];
  if (seg.type === "line") return [seg.from, seg.to];
  return [seg.from, seg.cp1, seg.cp2, seg.to];
}

export function pieceBounds(piece: PatternPiece): PieceBounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const seg of piece.paths) {
    for (const p of collectPoints(seg)) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }
  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function translatePoint(p: Point2, dx: number, dy: number): Point2 {
  return { x: p.x + dx, y: p.y + dy };
}

function translateSegment(
  seg: PathSegment,
  dx: number,
  dy: number
): PathSegment {
  if (seg.type === "move") {
    return { type: "move", to: translatePoint(seg.to, dx, dy) };
  }
  if (seg.type === "line") {
    return {
      type: "line",
      from: translatePoint(seg.from, dx, dy),
      to: translatePoint(seg.to, dx, dy),
      dash: seg.dash,
    };
  }
  return {
    type: "cubic",
    from: translatePoint(seg.from, dx, dy),
    cp1: translatePoint(seg.cp1, dx, dy),
    cp2: translatePoint(seg.cp2, dx, dy),
    to: translatePoint(seg.to, dx, dy),
    dash: seg.dash,
  };
}

export function translatePiece(
  piece: PatternPiece,
  dx: number,
  dy: number
): PatternPiece {
  return {
    ...piece,
    paths: piece.paths.map((s) => translateSegment(s, dx, dy)),
  };
}

const PIECE_LAYOUT_ORDER: Record<string, number> = {
  "blouse-front": 0,
  "blouse-back": 1,
  "skirt-front": 2,
  "skirt-back": 3,
  "pant-front": 0,
  "pant-back": 1,
  sleeve: 2,
  "collar-stand": 3,
  "collar-fall": 4,
  cuff: 5,
  waistband: 0,
  "chest-pocket": 1,
  placket: 0,
};

function layoutOrder(piece: PatternPiece): number {
  return PIECE_LAYOUT_ORDER[piece.id] ?? 99;
}

export function layoutPieces(
  pieces: PatternPiece[],
  gap = 56,
  padding = 24
): { pieces: PatternPiece[]; bounds: DraftBounds } {
  if (pieces.length === 0) {
    return { pieces: [], bounds: { width: 400, height: 400 } };
  }
  const sorted = [...pieces].sort((a, b) => layoutOrder(a) - layoutOrder(b));
  let cursorX = padding;
  let rowY = padding;
  let rowHeight = 0;
  const maxRowWidth = 5200;
  const laidOut: PatternPiece[] = [];

  for (const piece of sorted) {
    const b = pieceBounds(piece);
    if (b.width <= 0 && b.height <= 0) {
      laidOut.push(piece);
      continue;
    }
    if (cursorX > padding && cursorX + b.width > maxRowWidth) {
      cursorX = padding;
      rowY += rowHeight + gap;
      rowHeight = 0;
    }
    const dx = cursorX - b.minX;
    const dy = rowY - b.minY;
    laidOut.push(translatePiece(piece, dx, dy));
    cursorX += b.width + gap;
    rowHeight = Math.max(rowHeight, b.height);
  }

  let maxX = padding;
  let maxY = padding;
  for (const piece of laidOut) {
    const b = pieceBounds(piece);
    if (b.maxX + padding > maxX) maxX = b.maxX + padding;
    if (b.maxY + padding > maxY) maxY = b.maxY + padding;
  }

  return {
    pieces: laidOut,
    bounds: {
      width: Math.ceil(Math.max(maxX, 400)),
      height: Math.ceil(Math.max(maxY, 400)),
    },
  };
}
