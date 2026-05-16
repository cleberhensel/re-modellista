import { cubicSegment, lineSegment, point } from "../geometry.js";
import type { PantContext, PatternPiece } from "../types.js";

export function draftPantFront(ctx: PantContext): PatternPiece {
  const {
    startOne,
    hipQuarterPx,
    waistQuarterPx,
    crotchLineY,
    frontExtension,
    k,
    measurements,
  } = ctx;
  const hipX = hipQuarterPx + startOne;
  const waistX = waistQuarterPx + startOne;
  const crotchX = startOne + frontExtension;
  const inseamY = crotchLineY + measurements.inseam * k;
  const cfTop = point(startOne, startOne);
  const hipCrotch = point(hipX, crotchLineY);

  const outline = [
    lineSegment(cfTop, point(waistX, startOne)),
    lineSegment(point(waistX, startOne), hipCrotch),
    lineSegment(hipCrotch, point(hipX, inseamY)),
    lineSegment(point(hipX, inseamY), point(startOne, inseamY)),
    cubicSegment(
      point(startOne, inseamY),
      point(startOne + k * 0.6, inseamY - frontExtension * 0.35),
      point(crotchX - k * 0.3, crotchLineY + frontExtension * 0.25),
      point(crotchX, crotchLineY)
    ),
    lineSegment(point(crotchX, crotchLineY), hipCrotch),
  ];

  return {
    id: "pant-front",
    paths: [
      ...outline,
      lineSegment(cfTop, point(startOne, inseamY), true),
    ],
  };
}
