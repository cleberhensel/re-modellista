import { lineSegment, point } from "../geometry.js";
import type { DraftContext, PatternPiece } from "../types.js";

export function draftPlacket(ctx: DraftContext): PatternPiece {
  const { k, startOne, heightPx } = ctx;
  const width = 3 * k;
  const height = heightPx;
  const paths = [
    lineSegment(point(startOne, startOne), point(startOne + width, startOne)),
    lineSegment(point(startOne + width, startOne), point(startOne + width, startOne + height)),
    lineSegment(point(startOne + width, startOne + height), point(startOne, startOne + height)),
    lineSegment(point(startOne, startOne + height), point(startOne, startOne)),
  ];
  return { id: "placket", paths };
}
