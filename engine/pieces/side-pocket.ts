import { lineSegment, point } from "../geometry.js";
import { draftBlouseFront } from "./blouse-front.js";
import type { DraftContext, PatternPiece } from "../types.js";

export function draftSidePocket(ctx: DraftContext): PatternPiece {
  const front = draftBlouseFront(ctx);
  if (front.error || !front.points?.shoulderStart) {
    return { id: "side-pocket", paths: [], error: "side_pocket_unavailable" };
  }
  const shoulder = front.points.shoulderStart as { x: number; y: number };
  const { k } = ctx;
  const w = 14 * k;
  const h = 18 * k;
  const x0 = shoulder.x - 2 * k;
  const y0 = shoulder.y + ctx.heightPx * 0.45;
  const paths = [
    lineSegment(point(x0, y0), point(x0 + w, y0)),
    lineSegment(point(x0 + w, y0), point(x0 + w, y0 + h)),
    lineSegment(point(x0 + w, y0 + h), point(x0, y0 + h)),
    lineSegment(point(x0, y0 + h), point(x0, y0)),
  ];
  return { id: "side-pocket", paths };
}
