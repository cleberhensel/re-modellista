import { add, cubicSegment, lineSegment, point } from "./geometry.js";
import type { DraftContext, DraftOptions, PathSegment, Point2 } from "./types.js";

export interface ArmholePoints {
  p1: Point2;
  p2: Point2;
  p3: Point2;
  p4: Point2;
  p2HandleOut: Point2;
  p3HandleIn: Point2;
  p3HandleOut: Point2;
}

export function computeArmholePoints(
  ctx: DraftContext,
  intersectionY: number,
  options: DraftOptions = {}
): ArmholePoints {
  const { startOne, widthPx, k, s, seventh } = ctx;
  const alg = seventh.four + 0.3;
  const p1 = point(
    widthPx - s.two - s.four / 2 + startOne,
    intersectionY
  );
  const p2 = point(widthPx - s.two - s.four + startOne, 7 * k + intersectionY);
  const p3 = point(
    widthPx + startOne - s.two,
    s.one * 3 + s.two + startOne - s.four
  );
  let p4 = point(widthPx + startOne + k, s.one * 3 + s.two + startOne);
  if (options.sleeveless) {
    const offset = (options.armholeDepthOffsetCm ?? 2) * k;
    p4 = point(p4.x - offset, p4.y);
  }
  const p2Vec = point((p2.x - p1.x) * alg, (p2.y - p1.y) * alg);
  const p2HandleOut = point(
    p2Vec.x + p1.x - p2.x,
    p2Vec.y + p1.y - p2.y
  );
  return {
    p1,
    p2,
    p3,
    p4,
    p2HandleOut,
    p3HandleIn: point(-s.four, -s.four),
    p3HandleOut: point(s.four, s.four),
  };
}

export function armholePathSegments(ah: ArmholePoints): PathSegment[] {
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
      ah.p4,
      ah.p4
    ),
  ];
}
