import { lineSegment, point } from "../geometry.js";
import { draftBlouseFront } from "./blouse-front.js";
import type { DraftContext, PatternPiece } from "../types.js";

export function draftChestPocket(ctx: DraftContext): PatternPiece {
  const front = draftBlouseFront(ctx);
  if (front.error || !front.points?.shoulderStart) {
    return { id: "chest-pocket", paths: [], error: "pocket_blouse_unavailable" };
  }
  const shoulder = front.points.shoulderStart as { x: number; y: number };
  const { k } = ctx;
  const w = 12 * k;
  const h = 14 * k;
  const x0 = shoulder.x + 3 * k;
  const y0 = shoulder.y + 8 * k;
  const paths = [
    lineSegment(point(x0, y0), point(x0 + w, y0)),
    lineSegment(point(x0 + w, y0), point(x0 + w, y0 + h)),
    lineSegment(point(x0 + w, y0 + h), point(x0, y0 + h)),
    lineSegment(point(x0, y0 + h), point(x0, y0)),
    lineSegment(point(x0, y0), point(x0 + w / 2, y0 - k)),
  ];
  return { id: "chest-pocket", paths };
}
