import type { PatternDocument } from "../types.js";
import { documentBounds } from "../document.js";

export interface ViewportState {
  panX: number;
  panY: number;
  scale: number;
}

export const MIN_SCALE = 0.25;
export const MAX_SCALE = 4;

export function createViewport(): ViewportState {
  return { panX: 0, panY: 0, scale: 1 };
}

export function viewportTransform(v: ViewportState): string {
  return `translate(${v.panX}, ${v.panY}) scale(${v.scale})`;
}

export function screenToWorld(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
  v: ViewportState
): { x: number; y: number } {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const svgPt = pt.matrixTransform(ctm.inverse());
  return {
    x: (svgPt.x - v.panX) / v.scale,
    y: (svgPt.y - v.panY) / v.scale,
  };
}

export function zoomAt(
  v: ViewportState,
  factor: number,
  centerX: number,
  centerY: number
): void {
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
  const ratio = newScale / v.scale;
  v.panX = centerX - (centerX - v.panX) * ratio;
  v.panY = centerY - (centerY - v.panY) * ratio;
  v.scale = newScale;
}

export function fitToDocument(
  v: ViewportState,
  doc: PatternDocument,
  width: number,
  height: number,
  padding = 40
): void {
  const b = documentBounds(doc);
  const docW = b.maxX - b.minX || 400;
  const docH = b.maxY - b.minY || 400;
  const scaleX = (width - padding * 2) / docW;
  const scaleY = (height - padding * 2) / docH;
  v.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min(scaleX, scaleY)));
  v.panX = padding - b.minX * v.scale;
  v.panY = padding - b.minY * v.scale;
}
