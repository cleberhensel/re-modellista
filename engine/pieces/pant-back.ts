import { cubicSegment, lineSegment, point } from "../geometry.js";
import type { PantContext, PatternPiece } from "../types.js";

export function draftPantBack(ctx: PantContext): PatternPiece {
  const {
    startOne,
    hipQuarterPx,
    waistQuarterPx,
    crotchLineY,
    backExtension,
    k,
    measurements,
  } = ctx;
  const hipX = hipQuarterPx + startOne;
  const waistX = waistQuarterPx + startOne;
  const crotchX = startOne + backExtension;
  const inseamY = crotchLineY + measurements.inseam * k;
  const dartSpread = 1.5 * k;
  const dartX = startOne + (waistX - startOne) * 0.55;
  const cfTop = point(startOne, startOne);
  const hipCrotch = point(hipX, crotchLineY);

  const outline = [
    lineSegment(cfTop, point(waistX, startOne)),
    lineSegment(point(waistX, startOne), hipCrotch),
    lineSegment(hipCrotch, point(hipX, inseamY)),
    lineSegment(point(hipX, inseamY), point(startOne, inseamY)),
    cubicSegment(
      point(startOne, inseamY),
      point(startOne + k, inseamY - backExtension * 0.3),
      point(crotchX - k * 0.2, crotchLineY + backExtension * 0.35),
      point(crotchX, crotchLineY)
    ),
    lineSegment(point(crotchX, crotchLineY), hipCrotch),
  ];

  const construction = [
    lineSegment(cfTop, point(startOne, inseamY), true),
    lineSegment(point(dartX, startOne), point(dartX + dartSpread, startOne + k), true),
    lineSegment(point(dartX, startOne), point(dartX - dartSpread, startOne + k), true),
  ];

  return {
    id: "pant-back",
    paths: [...outline, ...construction],
  };
}
