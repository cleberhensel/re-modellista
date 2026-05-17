import type { Point2 } from "../../engine/types.js";
import type { EditablePath } from "../types.js";

const CF_EPS = 2;

export function cutMinX(cut: EditablePath): number {
  return Math.min(...cut.nodes.map((n) => n.x));
}

export function cfNeckNode(cut: EditablePath) {
  const x0 = cutMinX(cut);
  const cf = cut.nodes.filter((n) => Math.abs(n.x - x0) < CF_EPS);
  if (cf.length === 0) return undefined;
  return cf.reduce((a, b) => (a.y < b.y ? a : b));
}

export function cfHemNode(cut: EditablePath) {
  const x0 = cutMinX(cut);
  const cf = cut.nodes.filter((n) => Math.abs(n.x - x0) < CF_EPS);
  if (cf.length === 0) return undefined;
  return cf.reduce((a, b) => (a.y > b.y ? a : b));
}

export function sideBottomNode(cut: EditablePath) {
  const hemY = Math.max(...cut.nodes.map((n) => n.y));
  const hemBand = cut.nodes.filter((n) => Math.abs(n.y - hemY) < CF_EPS * 2);
  if (hemBand.length === 0) {
    return cut.nodes.reduce((a, b) => (a.x > b.x ? a : b));
  }
  return hemBand.reduce((a, b) => (a.x > b.x ? a : b));
}

export function resolveCfGuide(neck: Point2, hem: Point2): {
  cf_neck: Point2;
  cf_hem: Point2;
} {
  return {
    cf_neck: { x: neck.x, y: neck.y },
    cf_hem: { x: hem.x, y: hem.y },
  };
}

export function pointOnHemEdge(hemA: Point2, hemB: Point2, targetX: number): Point2 {
  const dx = hemB.x - hemA.x;
  if (Math.abs(dx) < 1e-6) {
    return { x: hemA.x, y: Math.max(hemA.y, hemB.y) };
  }
  let t = (targetX - hemA.x) / dx;
  t = Math.max(0, Math.min(1, t));
  return {
    x: hemA.x + t * dx,
    y: hemA.y + t * (hemB.y - hemA.y),
  };
}

export function resolveDartFeet(
  hemA: Point2,
  hemB: Point2,
  dartCenterX: number,
  dartSpread: number
): { center: Point2; plus: Point2; minus: Point2 } {
  return {
    center: pointOnHemEdge(hemA, hemB, dartCenterX),
    plus: pointOnHemEdge(hemA, hemB, dartCenterX + dartSpread),
    minus: pointOnHemEdge(hemA, hemB, dartCenterX - dartSpread),
  };
}
