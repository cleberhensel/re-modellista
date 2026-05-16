import {
  computeArmholeBackPoints,
  armholeBackPathSegments,
} from "../armhole-back.js";
import {
  computeArmholePoints,
  armholePathSegments,
} from "../armhole.js";
import { cubicSegment, lineSegment, point } from "../geometry.js";
import { pathLength } from "../geometry/pathLength.js";
import { draftBlouseBack } from "./blouse-back.js";
import { draftBlouseFront } from "./blouse-front.js";
import { applySleeveHandles, type SleeveVertex } from "../sleeve-handles.js";
import { computeSleeveGrid } from "../sleeve-grid.js";
import type { DraftContext, PatternPiece, PathSegment } from "../types.js";

export function armholeLengthFromContext(ctx: DraftContext): number | null {
  const lengths = armholeLengthsFromContext(ctx);
  if (!lengths) return null;
  return (lengths.front + lengths.back) / 2;
}

export function armholeLengthsFromContext(
  ctx: DraftContext
): { front: number; back: number } | null {
  const front = draftBlouseFront(ctx);
  const back = draftBlouseBack(ctx);
  if (front.error || back.error || !front.points?.intersection) {
    return null;
  }
  const frontY = (front.points.intersection as { y: number }).y;
  const backIntersection = back.points?.intersection as { y: number } | undefined;
  const backY = backIntersection?.y ?? frontY;
  const ahFront = computeArmholePoints(ctx, frontY);
  const ahBack = computeArmholeBackPoints(ctx, backY);
  return {
    front: pathLength(armholePathSegments(ahFront)),
    back: pathLength(armholeBackPathSegments(ahBack)),
  };
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
  const lengths = armholeLengthsFromContext(ctx);
  if (!lengths || lengths.front <= 0) {
    return {
      id: "sleeve",
      paths: [],
      error: "sleeve_armhole_unavailable",
    };
  }
  const gridWidth = ((lengths.front + lengths.back) / 2) * gridWidthScale;
  const grid = computeSleeveGrid(ctx, gridWidth);
  const verts = applySleeveHandles(vertexPoints(grid));
  verts[verts.length - 1] = {
    ...verts[verts.length - 1],
    handleIn: point(0, 0),
    handleOut: point(0, 0),
  };

  const outline: PathSegment[] = capPathSegments(verts);

  const { k, measurements } = ctx;
  const widthFist = measurements.wrist * k + 5 * k;
  const yWrist = grid.h4Left.y + measurements.sleeveLength * k;
  const capCenterX = (grid.h4Left.x + grid.h4Right.x) / 2;
  const cuffLeft = point(capCenterX - widthFist / 2, yWrist);
  const cuffRight = point(capCenterX + widthFist / 2, yWrist);

  outline.push(lineSegment(grid.h4Right, cuffRight));
  outline.push(lineSegment(cuffRight, cuffLeft));
  outline.push(lineSegment(cuffLeft, grid.h4Left));

  const capCurveLength = pathLength(outline.slice(0, outline.length - 3));
  const capEase = capCurveLength - (lengths.front + lengths.back);

  return {
    id: "sleeve",
    paths: outline,
    points: {
      grid,
      armholeLength: lengths.front,
      armholeLengthBack: lengths.back,
      capEase,
    },
  };
}
