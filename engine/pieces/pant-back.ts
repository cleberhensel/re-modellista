import { cubicSegment, lineSegment, point } from "../geometry.js";
import type { PantContext, PatternPiece } from "../types.js";

export function draftPantBack(ctx: PantContext): PatternPiece {
  const {
    startOne,
    hipQuarterPx,
    waistQuarterPx,
    crotchLineY,
    outseamPx,
    backExtension,
    k,
  } = ctx;
  const hipX = hipQuarterPx + startOne;
  const waistX = waistQuarterPx + startOne;
  const crotchX = startOne + backExtension;
  const inseamY = crotchLineY + ctx.measurements.inseam * k;
  const outseamY = outseamPx + startOne;
  const dartSpread = 1.5 * k;
  const dartX = startOne + (waistX - startOne) * 0.55;
  const cfTop = point(startOne, startOne);

  const outline = [
    lineSegment(cfTop, point(waistX, startOne)),
    lineSegment(point(waistX, startOne), point(hipX, crotchLineY)),
    lineSegment(point(hipX, crotchLineY), point(hipX, outseamY)),
    lineSegment(point(hipX, outseamY), point(startOne, outseamY)),
    lineSegment(point(startOne, outseamY), point(startOne, inseamY)),
    cubicSegment(
      point(startOne, inseamY),
      point(startOne + k, inseamY - backExtension * 0.25),
      point(crotchX, crotchLineY + backExtension * 0.5),
      point(crotchX, crotchLineY)
    ),
  ];

  return {
    id: "pant-back",
    paths: [
      ...outline,
      lineSegment(cfTop, point(startOne, outseamY), true),
      lineSegment(point(dartX, startOne), point(dartX + dartSpread, startOne + k), true),
      lineSegment(point(dartX, startOne), point(dartX - dartSpread, startOne + k), true),
    ],
  };
}
