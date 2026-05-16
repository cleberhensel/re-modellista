import { buildContext } from "./context.js";
import { draftBlouseFront } from "./pieces/blouse-front.js";
import type {
  DraftBounds,
  DraftContext,
  DraftOptions,
  DraftResult,
  Measurements,
  PathSegment,
  PatternPiece,
  Point2,
} from "./types.js";

export { buildContext } from "./context.js";
export { DEFAULT_MARGIN_CM, DEFAULT_PX_PER_CM } from "./constants.js";
export {
  getGuardrails,
  resolveMeasurements,
  blouseFrontGuardrails,
  isBlouseFrontStable,
} from "./guardrails/index.js";
export { seventhFromBustCm, seventhToPx } from "./seventh.js";
export type {
  DraftContext,
  DraftOptions,
  DraftResult,
  Measurements,
  PathSegment,
  PatternPiece,
  Point2,
} from "./types.js";

export function draft(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const ctx = buildContext(measurements, options);
  const pieces: PatternPiece[] = [];
  if (options.piece === "back") {
    pieces.push({
      id: "blouse-back",
      paths: [],
      note: "not_implemented",
    });
  } else {
    pieces.push(draftBlouseFront(ctx));
  }
  const bounds = computeBounds(pieces, ctx);
  return { ctx, pieces, bounds };
}

export function computeBounds(
  pieces: PatternPiece[],
  ctx: DraftContext
): DraftBounds {
  let maxX = ctx.widthPx + ctx.start + ctx.k + 80;
  let maxY = ctx.heightPx + ctx.start + 80;
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

function collectPoints(seg: PathSegment): Point2[] {
  if (seg.type === "move") return [seg.to];
  if (seg.type === "line") return [seg.from, seg.to];
  return [seg.from, seg.cp1, seg.cp2, seg.to];
}
