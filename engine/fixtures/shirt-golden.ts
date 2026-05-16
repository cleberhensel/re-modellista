import { buildContext } from "../context.js";
import { draftCollarStand } from "../pieces/collar.js";
import { draftSleevePiece } from "../pieces/sleeve.js";
import { defaultBodiceMeasurements } from "./blouse-golden.js";

export function goldenShirtPieceCount(): number {
  return 8;
}

export function goldenShirtCollarNecklineLength() {
  const ctx = buildContext(defaultBodiceMeasurements);
  const stand = draftCollarStand(ctx);
  return stand.points?.necklineLength as number;
}

export function goldenShirtSleeveArmholeLength() {
  const ctx = buildContext(defaultBodiceMeasurements);
  const sleeve = draftSleevePiece(ctx);
  return sleeve.points?.armholeLength as number;
}
