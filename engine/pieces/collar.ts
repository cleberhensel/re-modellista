import { cubicSegment, lineSegment, point } from "../geometry.js";
import { pathLength } from "../geometry/pathLength.js";
import { draftBlouseBack } from "./blouse-back.js";
import { draftBlouseFront } from "./blouse-front.js";
import type { DraftContext, PatternPiece } from "../types.js";

function necklineLength(ctx: DraftContext): number {
  const front = draftBlouseFront(ctx);
  const back = draftBlouseBack(ctx);
  if (front.error || back.error) {
    return 0;
  }
  const frontCollar = front.paths.slice(0, 1);
  const backCollar = back.paths.slice(0, 1);
  return pathLength(frontCollar) + pathLength(backCollar);
}

export function draftCollarStand(ctx: DraftContext): PatternPiece {
  const { k, startOne } = ctx;
  const len = necklineLength(ctx) + 0.5 * k;
  const height = 3 * k;
  const paths = [
    lineSegment(point(startOne, startOne), point(startOne + len, startOne)),
    cubicSegment(
      point(startOne + len, startOne),
      point(startOne + len, startOne + height * 0.5),
      point(startOne, startOne + height * 0.5),
      point(startOne, startOne + height)
    ),
    lineSegment(point(startOne, startOne + height), point(startOne, startOne)),
  ];
  return { id: "collar-stand", paths, points: { necklineLength: len } };
}

export function draftCollarFall(ctx: DraftContext): PatternPiece {
  const { k, startOne } = ctx;
  const len = necklineLength(ctx) + 0.5 * k;
  const height = 4 * k;
  const paths = [
    lineSegment(point(startOne, startOne), point(startOne + len, startOne)),
    lineSegment(point(startOne + len, startOne), point(startOne + len, startOne + height)),
    lineSegment(point(startOne + len, startOne + height), point(startOne, startOne + height)),
    lineSegment(point(startOne, startOne + height), point(startOne, startOne)),
  ];
  return { id: "collar-fall", paths };
}
