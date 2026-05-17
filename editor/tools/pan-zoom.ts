import { zoomAt } from "../canvas/viewport.js";
import type { EditorTool, ToolContext } from "./types.js";

let panning = false;
let lastX = 0;
let lastY = 0;

export const panTool: EditorTool = {
  id: "pan",
  onDeactivate() {
    panning = false;
  },
  onPointerDown(e, ctx) {
    panning = true;
    lastX = e.clientX;
    lastY = e.clientY;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    if (ctx.svg) ctx.svg.style.cursor = "grabbing";
  },
  onPointerMove(e, ctx) {
    if (!panning) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    ctx.viewport.panX += dx;
    ctx.viewport.panY += dy;
    lastX = e.clientX;
    lastY = e.clientY;
    ctx.requestRedraw();
  },
  onPointerUp(_e, ctx) {
    panning = false;
    if (ctx.svg) ctx.svg.style.cursor = "";
  },
};

export function handleWheel(e: WheelEvent, ctx: ToolContext, svg: SVGSVGElement): void {
  e.preventDefault();
  e.stopPropagation();

  if (e.ctrlKey || e.metaKey) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const svgPt = pt.matrixTransform(ctm.inverse());
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    zoomAt(ctx.viewport, factor, svgPt.x, svgPt.y);
    ctx.requestRedraw();
    return;
  }

  if (e.shiftKey) {
    const dx = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    ctx.viewport.panX -= dx;
    ctx.requestRedraw();
    return;
  }

  if (e.altKey) {
    ctx.viewport.panY -= e.deltaY;
    ctx.requestRedraw();
    return;
  }

  ctx.viewport.panX -= e.deltaX;
  ctx.viewport.panY -= e.deltaY;
  ctx.requestRedraw();
}
