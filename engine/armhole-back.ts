import { add, cubicSegment, lineSegment, point } from "./geometry.js";
import type { DraftContext, DraftOptions, PathSegment, Point2 } from "./types.js";

export interface ArmholeBackPoints {
  p1: Point2;
  p2: Point2;
  p3: Point2;
  p4: Point2;
  p2HandleIn: Point2;
  p2HandleOut: Point2;
  p3HandleIn: Point2;
  p3HandleOut: Point2;
  p4HandleIn: Point2;
}

export function computeArmholeBackPoints(
  ctx: DraftContext,
  intersectionY: number,
  options: DraftOptions = {}
): ArmholeBackPoints {
  const { startOne, widthPx, k, s } = ctx;
  const p1 = point(
    widthPx + startOne - s.two - s.four + k,
    intersectionY
  );
  const p2 = point(
    p1.x,
    s.one * 3 + startOne - s.two - s.four
  );
  const p3 = point(
    widthPx + startOne - s.two + k,
    s.one * 3 + s.four + startOne - k
  );
  let p4 = point(
    widthPx + startOne + k,
    s.one * 3 + s.two + startOne
  );
  if (options.sleeveless) {
    const offset = (options.armholeDepthOffsetCm ?? 2) * k;
    p4 = point(p4.x - offset, p4.y);
  }
  return {
    p1,
    p2,
    p3,
    p4,
    p2HandleIn: point(0, -s.two),
    p2HandleOut: point(0, s.two),
    p3HandleIn: point(-s.four / 2, -s.four / 2),
    p3HandleOut: point(s.four / 2, s.four / 2),
    p4HandleIn: point(-s.four / 2, -s.four / 4),
  };
}

export function armholeBackPathSegments(ah: ArmholeBackPoints): PathSegment[] {
  return [
    lineSegment(ah.p1, ah.p2),
    cubicSegment(
      ah.p2,
      add(ah.p2, ah.p2HandleOut),
      add(ah.p3, ah.p3HandleIn),
      ah.p3
    ),
    cubicSegment(
      ah.p3,
      add(ah.p3, ah.p3HandleOut),
      add(ah.p4, ah.p4HandleIn),
      ah.p4
    ),
  ];
}
