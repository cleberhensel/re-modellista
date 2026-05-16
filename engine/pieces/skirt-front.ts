import { cubicSegment, lineSegment, point } from "../geometry.js";
import type { PathSegment, PatternPiece, SkirtContext } from "../types.js";

export function draftSkirtFront(ctx: SkirtContext): PatternPiece {
  const { startOne, waistFrontQuarterPx, hipQuarterPx, hipLineY, hemY, k } = ctx;
  const waistX = waistFrontQuarterPx + startOne;
  const hipX = hipQuarterPx + startOne;
  const dartSpread = 0.625 * k;
  const dartCenterX = startOne + (waistX - startOne) * 0.55;
  const cfTop = point(startOne, startOne);
  const cfHem = point(startOne, hemY);

  const outline = [
    cubicSegment(
      cfTop,
      point(startOne + waistFrontQuarterPx * 0.35, startOne),
      point(waistX - waistFrontQuarterPx * 0.15, startOne),
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

  return { id: "skirt-front", paths: [...outline, ...construction] };
}
