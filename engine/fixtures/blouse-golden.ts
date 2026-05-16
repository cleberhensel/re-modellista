import { buildContext } from "../context.js";
import { draftBlouseFront } from "../pieces/blouse-front.js";
import type { Measurements } from "../types.js";

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
): { x: number; y: number } {
  const ctx = buildContext(m);
  const s = ctx.s;
  return { x: s.one + ctx.startOne, y: ctx.startOne };
}
