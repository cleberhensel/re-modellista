import { lineIntersection, point } from "./geometry.js";
import type { DraftContext, Point2 } from "./types.js";

export interface SleeveGrid {
  p1: Point2;
  p2: Point2;
  p3: Point2;
  p4: Point2;
  p5: Point2;
  p6: Point2;
  p7: Point2;
  p8: Point2;
  h4Left: Point2;
  h4Right: Point2;
  gridWidth: number;
}

function horiz(y: number, x0: number, x1: number): [Point2, Point2] {
  return [point(x0, y), point(x1, y)];
}

function vert(x: number, y0: number, y1: number): [Point2, Point2] {
  return [point(x, y0), point(x, y1)];
}

export function computeSleeveGrid(
  ctx: DraftContext,
  gridWidth: number
): SleeveGrid {
  const { startOne, s, k } = ctx;
  const width = gridWidth;
  const rightX = width * 2 + startOne;
  const centerX = width + startOne;
  const leftCenterX = (width + startOne) / 2;
  const rightCenterX = leftCenterX + centerX;

  const h1 = startOne;
  const h2 = startOne + s.two;
  const h3 = startOne + s.one + s.two;
  const h4 = startOne + s.one * 2;
  const yMax = h4 + 800;

  const i1Raw = lineIntersection(
    ...vert(leftCenterX, h1, yMax),
    ...horiz(h3, startOne, rightX)
  );
  const p2 = point(
    (i1Raw ?? point(leftCenterX, h3)).x - 3.3 * k,
    (i1Raw ?? point(leftCenterX, h3)).y
  );

  const i2Raw = lineIntersection(
    ...vert(leftCenterX, h1, yMax),
    ...horiz(h2, startOne, rightX)
  );
  const p3 = point(
    (i2Raw ?? point(leftCenterX, h2)).x,
    (i2Raw ?? point(leftCenterX, h2)).y + 2.5 * k
  );
  const p4 = point(
    (i2Raw ?? point(leftCenterX, h2)).x + 2.5 * k,
    (i2Raw ?? point(leftCenterX, h2)).y
  );

  const p5 =
    lineIntersection(
      ...vert(centerX, h1, yMax),
      ...horiz(h1, startOne, rightX)
    ) ?? point(centerX, h1);

  const p6 =
    lineIntersection(
      ...vert(rightCenterX, h1, yMax),
      ...horiz(h2, startOne, rightX)
    ) ?? point(rightCenterX, h2);

  const i5Raw = lineIntersection(
    ...vert(rightCenterX, h1, yMax),
    ...horiz(h3, startOne, rightX)
  );
  const p7 = point(
    (i5Raw ?? point(rightCenterX, h3)).x + (s.one - k),
    (i5Raw ?? point(rightCenterX, h3)).y
  );

  const p1 = point(startOne, h4);
  const p8 = point(rightX, h4);

  return {
    p1,
    p2,
    p3,
    p4,
    p5,
    p6,
    p7,
    p8,
    h4Left: p1,
    h4Right: p8,
    gridWidth: width,
  };
}
