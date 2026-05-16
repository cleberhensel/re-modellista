import { buildSkirtContext } from "../skirt-context.js";
import { draftSkirtFront } from "../pieces/skirt-front.js";

const skirtM = {
  waist: 70,
  hip: 96,
  hipDepth: 20,
  skirtLength: 60,
};

export function goldenSkirtFrontHipLineY() {
  const ctx = buildSkirtContext(skirtM);
  return ctx.hipLineY;
}

export function goldenSkirtFrontWaistX() {
  const ctx = buildSkirtContext(skirtM);
  const piece = draftSkirtFront(ctx);
  const waistSeg = piece.paths[0];
  if (waistSeg.type === "cubic") {
    return waistSeg.to.x;
  }
  return ctx.waistFrontQuarterPx + ctx.startOne;
}
