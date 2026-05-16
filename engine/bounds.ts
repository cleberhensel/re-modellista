import type {
  DraftBounds,
  DraftContext,
  PantContext,
  PathSegment,
  PatternPiece,
  Point2,
  SkirtContext,
} from "./types.js";

function collectPoints(seg: PathSegment): Point2[] {
  if (seg.type === "move") return [seg.to];
  if (seg.type === "line") return [seg.from, seg.to];
  return [seg.from, seg.cp1, seg.cp2, seg.to];
}

function defaultBounds(ctx: DraftContext | SkirtContext | PantContext): DraftBounds {
  if ("widthPx" in ctx) {
    return {
      width: Math.ceil(ctx.widthPx + ctx.start + ctx.k + 80),
      height: Math.ceil(ctx.heightPx + ctx.start + 80),
    };
  }
  if ("hemY" in ctx) {
    return {
      width: Math.ceil(ctx.hipQuarterPx + ctx.startOne + 80),
      height: Math.ceil(ctx.hemY + 80),
    };
  }
  return {
    width: Math.ceil(ctx.hipQuarterPx + ctx.startOne + 80),
    height: Math.ceil(ctx.outseamPx + ctx.startOne + 80),
  };
}

export function computeBounds(
  pieces: PatternPiece[],
  ctx: DraftContext | SkirtContext | PantContext
): DraftBounds {
  const base = defaultBounds(ctx);
  let maxX = base.width;
  let maxY = base.height;
  for (const piece of pieces) {
    for (const seg of piece.paths) {
      for (const p of collectPoints(seg)) {
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
    }
  }
  return { width: Math.ceil(maxX), height: Math.ceil(maxY) };
}
