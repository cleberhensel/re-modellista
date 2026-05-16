import { buildContext } from "../context.js";
import { draftBlouseBack } from "../pieces/blouse-back.js";
import { draftBlouseFront } from "../pieces/blouse-front.js";
import type { Measurements, Point2 } from "../types.js";

export const defaultBodiceMeasurements: Measurements = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

export function goldenBlouseFrontDartCenterX(
  m: Measurements = defaultBodiceMeasurements
): number {
  const ctx = buildContext(m);
  const piece = draftBlouseFront(ctx);
  return piece.points?.dartCenterX as number;
}

export function goldenBlouseFrontCollarEnd(
  m: Measurements = defaultBodiceMeasurements
): Point2 {
  const ctx = buildContext(m);
  const s = ctx.s;
  return { x: s.one + ctx.startOne, y: ctx.startOne };
}

export function goldenBlouseFrontKeyPoints(m = defaultBodiceMeasurements) {
  const ctx = buildContext(m);
  const piece = draftBlouseFront(ctx);
  const ah = piece.points?.armhole as { p4: Point2 };
  return {
    intersection: piece.points?.intersection as Point2,
    shoulderStart: piece.points?.shoulderStart as Point2,
    p4: ah.p4,
    cfHem: { x: ctx.startOne, y: ctx.heightPx + ctx.startOne },
  };
}

export function goldenBlouseBackKeyPoints(m = defaultBodiceMeasurements) {
  const ctx = buildContext(m);
  const piece = draftBlouseBack(ctx);
  const ah = piece.points?.armhole as { p4: Point2 };
  return {
    intersection: piece.points?.intersection as Point2,
    shoulderStart: piece.points?.shoulderStart as Point2,
    p4: ah.p4,
    cfHem: { x: ctx.startOne, y: ctx.heightPx + ctx.startOne },
  };
}
