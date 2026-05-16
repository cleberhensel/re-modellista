import { buildContext } from "../context.js";
import { computeBounds } from "../bounds.js";
import { draftBlouseBack } from "../pieces/blouse-back.js";
import { draftBlouseFront } from "../pieces/blouse-front.js";
import { draftCollarFall, draftCollarStand } from "../pieces/collar.js";
import { draftCuff } from "../pieces/cuff.js";
import { draftChestPocket } from "../pieces/pocket.js";
import { draftPlacket } from "../pieces/placket.js";
import { draftSleevePiece } from "../pieces/sleeve.js";
import type { DraftOptions, DraftResult, Measurements } from "../types.js";

export function draftShirt(
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const ctx = buildContext(measurements, options);
  const front = draftBlouseFront(ctx);
  const back = draftBlouseBack(ctx);
  const sleeve = draftSleevePiece(ctx);
  const collarStand = draftCollarStand(ctx);
  const collarFall = draftCollarFall(ctx);
  const cuff = draftCuff(ctx);
  const placket = draftPlacket(ctx);
  const pocket = draftChestPocket(ctx);
  const pieces = [
    front,
    back,
    sleeve,
    collarStand,
    collarFall,
    cuff,
    placket,
    pocket,
  ].filter((p) => p.paths.length > 0 || p.error);
  return {
    productId: "camisa",
    ctx,
    pieces,
    bounds: computeBounds(pieces, ctx),
  };
}
