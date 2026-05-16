import {
  computeArmholeBackPoints,
  armholeBackPathSegments,
} from "../armhole-back.js";
import {
  add,
  cubicSegment,
  lineIntersection,
  lineSegment,
  point,
} from "../geometry.js";
import type { DraftContext, PatternPiece, PathSegment } from "../types.js";

export function draftBlouseBack(ctx: DraftContext): PatternPiece {
  const { startOne, widthPx, heightPx, hipPx, s, k } = ctx;
  const hemY = heightPx + startOne;
  const cfNeck = point(startOne, startOne + s.one);
  const cfHem = point(startOne, hemY);
  const shoulderStart = point(s.one + startOne - k, startOne);
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
      id: "blouse-back",
      paths: [],
      points: {},
      error: "shoulder_virtual_no_intersection",
    };
  }
  const ah = computeArmholeBackPoints(ctx, intersection.y, ctx.draftOptions);
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
  const sideBottom = point(widthPx + startOne - 4 * k, hemY);
  const collarStart = cfNeck;
  const collarEnd = shoulderStart;

  const outline: PathSegment[] = [
    cubicSegment(
      collarStart,
      add(collarStart, point(3 * k, k / 2)),
      collarEnd,
      collarEnd
    ),
    lineSegment(shoulderStart, intersection),
    lineSegment(intersection, ah.p1),
    ...armholeBackPathSegments(ah),
    lineSegment(ah.p4, sideTop),
    lineSegment(sideTop, sideBottom),
    lineSegment(sideBottom, cfHem),
  ];

  const construction: PathSegment[] = [
    lineSegment(cfNeck, cfHem, true),
    lineSegment(shoulderStart, shoulderEnd, true),
  ];

  if (!ctx.draftOptions.suppressDarts) {
    construction.push(
      lineSegment(point(dartCenterX, dartTopY), point(dartCenterX, hemY), true),
      lineSegment(
        point(dartCenterX, dartTopY),
        point(dartCenterX + dartSpread, hemY),
        true
      ),
      lineSegment(
        point(dartCenterX, dartTopY),
        point(dartCenterX - dartSpread, hemY),
        true
      )
    );
  }
  if (grainHit) {
    construction.push(lineSegment(grainHit, grainBottom, true));
  }

  return {
    id: "blouse-back",
    paths: [...outline, ...construction],
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
