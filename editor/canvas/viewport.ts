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

export interface FitToDocumentOptions {
  padding?: number;
  zoomFactor?: number;
  contentInsetLeft?: number;
}

export const EDITOR_INITIAL_FIT: FitToDocumentOptions = {
  padding: 50,
  zoomFactor: 1,
  contentInsetLeft: 250,
};

export function fitToDocument(
  v: ViewportState,
  doc: PatternDocument,
  width: number,
  height: number,
  options: FitToDocumentOptions = {}
): void {
  const padding = options.padding ?? 40;
  const zoomFactor = options.zoomFactor ?? 1;
  const insetLeft = options.contentInsetLeft ?? 0;
  const b = documentBounds(doc);
  const docW = b.maxX - b.minX || 400;
  const docH = b.maxY - b.minY || 400;
  const availW = Math.max(1, width - insetLeft);
  const scaleX = (availW - padding * 2) / docW;
  const scaleY = (height - padding * 2) / docH;
  v.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min(scaleX, scaleY)));
  const docCx = (b.minX + b.maxX) / 2;
  const docCy = (b.minY + b.maxY) / 2;
  const viewCx = insetLeft + availW / 2;
  const viewCy = height / 2;
  v.panX = viewCx - docCx * v.scale;
  v.panY = viewCy - docCy * v.scale;
  if (zoomFactor !== 1) {
    zoomAt(v, zoomFactor, viewCx, viewCy);
  }
}

export function visibleWorldBounds(
  v: ViewportState,
  viewportWidth: number,
  viewportHeight: number,
  margin = 80
): { minX: number; minY: number; maxX: number; maxY: number } {
  const minX = -v.panX / v.scale - margin;
  const minY = -v.panY / v.scale - margin;
  const maxX = (viewportWidth - v.panX) / v.scale + margin;
  const maxY = (viewportHeight - v.panY) / v.scale + margin;
  return { minX, minY, maxX, maxY };
}

