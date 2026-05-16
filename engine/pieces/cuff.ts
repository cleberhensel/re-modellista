import { lineSegment, point } from "../geometry.js";
import type { DraftContext, PatternPiece } from "../types.js";

export function draftCuff(ctx: DraftContext): PatternPiece {
  const { k, startOne, measurements } = ctx;
  const width = measurements.wrist * k + 5 * k;
  const height = 3 * k;
  const paths = [
    lineSegment(point(startOne, startOne), point(startOne + width, startOne)),
    lineSegment(point(startOne + width, startOne), point(startOne + width, startOne + height)),
    lineSegment(point(startOne + width, startOne + height), point(startOne, startOne + height)),
    lineSegment(point(startOne, startOne + height), point(startOne, startOne)),
  ];
  return { id: "cuff", paths };
}
