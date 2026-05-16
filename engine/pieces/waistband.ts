import { lineSegment, point } from "../geometry.js";
import type { DraftContext, PatternPiece } from "../types.js";

export function draftWaistband(ctx: DraftContext): PatternPiece {
  const { k, startOne, measurements } = ctx;
  const width = measurements.waist * k + 4 * k;
  const height = measurements.height * k;
  const paths = [
    lineSegment(point(startOne, startOne), point(startOne + width, startOne)),
    lineSegment(point(startOne + width, startOne), point(startOne + width, startOne + height)),
    lineSegment(point(startOne + width, startOne + height), point(startOne, startOne + height)),
    lineSegment(point(startOne, startOne + height), point(startOne, startOne)),
  ];
  return { id: "waistband", paths };
}
