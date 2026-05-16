import { cubicSegment, lineSegment, point } from "../geometry.js";
import type { PantContext, PatternPiece } from "../types.js";

export function draftPantFront(ctx: PantContext): PatternPiece {
  const {
    startOne,
    hipQuarterPx,
    waistQuarterPx,
    crotchLineY,
    outseamPx,
    frontExtension,
    k,
  } = ctx;
  const hipX = hipQuarterPx + startOne;
  const waistX = waistQuarterPx + startOne;
  const crotchX = startOne + frontExtension;
  const inseamY = crotchLineY + ctx.measurements.inseam * k;
  const outseamY = outseamPx + startOne;
  const cfTop = point(startOne, startOne);

  const outline = [
    lineSegment(cfTop, point(waistX, startOne)),
    lineSegment(point(waistX, startOne), point(hipX, crotchLineY)),
    lineSegment(point(hipX, crotchLineY), point(hipX, outseamY)),
    lineSegment(point(hipX, outseamY), point(startOne, outseamY)),
    lineSegment(point(startOne, outseamY), point(startOne, inseamY)),
    cubicSegment(
      point(startOne, inseamY),
      point(startOne + k * 0.5, inseamY - frontExtension * 0.3),
      point(crotchX, crotchLineY + frontExtension * 0.4),
      point(crotchX, crotchLineY)
    ),
  ];

  return {
    id: "pant-front",
    paths: [
      ...outline,
      lineSegment(cfTop, point(startOne, outseamY), true),
    ],
  };
}
