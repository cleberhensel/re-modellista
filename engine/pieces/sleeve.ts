import {
  computeArmholePoints,
  armholePathSegments,
} from "../armhole.js";
import { cubicSegment, lineSegment, point } from "../geometry.js";
import { pathLength } from "../geometry/pathLength.js";
import { draftBlouseFront } from "./blouse-front.js";
import { applySleeveHandles, type SleeveVertex } from "../sleeve-handles.js";
import { computeSleeveGrid } from "../sleeve-grid.js";
import type { DraftContext, PatternPiece, PathSegment } from "../types.js";

export function armholeLengthFromContext(ctx: DraftContext): number | null {
  const front = draftBlouseFront(ctx);
  if (front.error || !front.points?.intersection) {
    return null;
  }
  const intersection = front.points.intersection as { y: number };
  const ah = computeArmholePoints(ctx, intersection.y);
  return pathLength(armholePathSegments(ah));
}

function vertexPoints(grid: ReturnType<typeof computeSleeveGrid>): SleeveVertex[] {
  return [grid.p1, grid.p2, grid.p3, grid.p4, grid.p5, grid.p6, grid.p7, grid.p8].map(
    (p) => ({
      point: p,
      handleIn: point(0, 0),
      handleOut: point(0, 0),
    })
  );
}

function capPathSegments(verts: SleeveVertex[]): PathSegment[] {
  const segments: PathSegment[] = [];
  const capEnd = verts.length - 1;
  for (let i = 0; i < capEnd - 1; i++) {
    const curr = verts[i];
    const next = verts[i + 1];
    segments.push(
      cubicSegment(
        curr.point,
        point(curr.point.x + curr.handleOut.x, curr.point.y + curr.handleOut.y),
        point(next.point.x + next.handleIn.x, next.point.y + next.handleIn.y),
        next.point
      )
    );
  }
  segments.push(lineSegment(verts[capEnd - 1].point, verts[capEnd].point));
  return segments;
}

export function draftSleevePiece(
  ctx: DraftContext,
  gridWidthScale = 1
): PatternPiece {
  const armholeLen = armholeLengthFromContext(ctx);
  if (armholeLen === null || armholeLen <= 0) {
    return {
      id: "sleeve",
      paths: [],
      error: "sleeve_armhole_unavailable",
    };
  }
  const gridWidth = armholeLen * gridWidthScale;
  const grid = computeSleeveGrid(ctx, gridWidth);
  const verts = applySleeveHandles(vertexPoints(grid));
  verts[verts.length - 1] = {
    ...verts[verts.length - 1],
    handleIn: point(0, 0),
    handleOut: point(0, 0),
  };

  const outline: PathSegment[] = capPathSegments(verts);

  const { k, startOne, measurements } = ctx;
  const widthFist = measurements.wrist * k + 5 * k;
  const marginLeft = gridWidth * 2 - widthFist;
  const yWrist = startOne + measurements.sleeveLength * k;
  const cuffLeft = point(startOne + marginLeft, yWrist);
  const cuffRight = point(startOne + marginLeft + widthFist, yWrist);

  outline.push(lineSegment(grid.h4Left, cuffLeft));
  outline.push(lineSegment(cuffLeft, cuffRight));
  outline.push(lineSegment(cuffRight, grid.h4Right));

  return {
    id: "sleeve",
    paths: outline,
    points: { grid, armholeLength: armholeLen },
  };
}
