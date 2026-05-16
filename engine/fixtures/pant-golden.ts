import { buildPantContext } from "../pant-context.js";
import { draftPantFront } from "../pieces/pant-front.js";

const pantM = {
  waist: 70,
  hip: 96,
  crotchDepth: 26,
  inseam: 78,
};

export function goldenPantFrontCrotchLineY() {
  const ctx = buildPantContext(pantM);
  return ctx.crotchLineY;
}

export function goldenPantFrontHasOutline() {
  const ctx = buildPantContext(pantM);
  const piece = draftPantFront(ctx);
  return piece.paths.filter((s) => !s.dash).length >= 6;
}
