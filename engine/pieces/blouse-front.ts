import { computeArmholePoints, armholePathSegments } from "../armhole.js";
import {
  add,
  cubicSegment,
  lineIntersection,
  lineSegment,
  point,
} from "../geometry.js";
import type { DraftContext, PatternPiece, PathSegment } from "../types.js";

export function draftBlouseFront(ctx: DraftContext): PatternPiece {
  const { startOne, startTwo, widthPx, heightPx, hipPx, s, k } = ctx;
  const hemY = heightPx + startOne;
  const shoulderStart = point(s.one + startOne, startOne);
  const shoulderEnd = point(widthPx + startOne, s.two + startOne);
  const divStart = point(widthPx - s.two - s.four / 2 + startOne, startOne);
  const divEnd = point(divStart.x, s.one * 3 + s.two - s.four + startOne);
  const intersection = lineIntersection(
    shoulderStart,
    shoulderEnd,
    divStart,
    divEnd
  );
  if (!intersection) {
    return {
      id: "blouse-front",
      paths: [],
      points: {},
      error: "shoulder_virtual_no_intersection",
    };
  }
  const ah = computeArmholePoints(ctx, intersection.y);
  const dartCenterX = (hipPx + startOne) / 2;
  const dartTopY = hemY - 12 * k;
  const dartSpread = (k * 3) / 2;
  const grainX = widthPx / 2 + startOne;
  const grainBottom = point(grainX, hemY);
  const grainTop = point(grainX, startOne);
  const grainHit = lineIntersection(
    shoulderStart,
    shoulderEnd,
    grainTop,
    grainBottom
  );
  const sideTop = point(widthPx + k + startOne, s.one * 3 + s.two + startOne);
  const sideBottom = point(hipPx + startOne, hemY);
  const collarStart = point(startOne, s.one + startOne);
  const collarEnd = point(s.one + startOne, startOne);
  const paths: PathSegment[] = [
    lineSegment(
      point(startOne, startOne + s.one),
      point(startOne, hemY)
    ),
    cubicSegment(
      collarStart,
      add(collarStart, point(s.one, startTwo)),
      collarEnd,
      collarEnd
    ),
    lineSegment(shoulderStart, intersection),
    ...armholePathSegments(ah),
    lineSegment(ah.p4, sideTop),
    lineSegment(sideTop, sideBottom),
    lineSegment(point(hipPx + startOne, hemY), point(startOne, hemY)),
    lineSegment(
      point(dartCenterX, dartTopY),
      point(dartCenterX, hemY)
    ),
    lineSegment(
      point(dartCenterX, dartTopY),
      point(dartCenterX + dartSpread, hemY)
    ),
    lineSegment(
      point(dartCenterX, dartTopY),
      point(dartCenterX - dartSpread, hemY)
    ),
  ];
  if (grainHit) {
    paths.push(lineSegment(grainHit, grainBottom));
  }
  return {
    id: "blouse-front",
    paths,
    points: {
      shoulderStart,
      shoulderEnd,
      intersection,
      armhole: ah,
      sideTop,
      sideBottom,
      dartCenterX,
      grainHit,
    },
  };
}
