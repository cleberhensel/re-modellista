import { cubicSegment, lineSegment, point } from "../geometry.js";
import type { PathSegment, PatternPiece, SkirtContext } from "../types.js";

export function draftSkirtBack(ctx: SkirtContext): PatternPiece {
  const { startOne, waistQuarterPx, hipQuarterPx, hipLineY, hemY, k } = ctx;
  const waistX = waistQuarterPx + startOne;
  const hipX = hipQuarterPx + startOne;
  const dartSpread = 1.25 * k;
  const dartCenterX = startOne + (waistX - startOne) * 0.5;
  const cfTop = point(startOne, startOne);
  const cfHem = point(startOne, hemY);

  const outline = [
    cubicSegment(
      cfTop,
      point(startOne + waistQuarterPx * 0.3, startOne),
      point(waistX - waistQuarterPx * 0.12, startOne),
      point(waistX, startOne)
    ),
    lineSegment(point(waistX, startOne), point(hipX, hipLineY)),
    lineSegment(point(hipX, hipLineY), point(hipX, hemY)),
    lineSegment(point(hipX, hemY), cfHem),
  ];

  const construction: PathSegment[] = [
    lineSegment(cfTop, cfHem, true),
    lineSegment(
      point(dartCenterX, hipLineY),
      point(dartCenterX, hemY),
      true
    ),
    lineSegment(
      point(dartCenterX, hipLineY),
      point(dartCenterX + dartSpread, hemY),
      true
    ),
    lineSegment(
      point(dartCenterX, hipLineY),
      point(dartCenterX - dartSpread, hemY),
      true
    ),
  ];

  return { id: "skirt-back", paths: [...outline, ...construction] };
}
