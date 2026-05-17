import { distanceBetween } from "../geometry/arc-length.js";
import { pickEdge } from "../canvas/hit-test.js";
import type { EditorTool } from "./types.js";

let start: { x: number; y: number } | null = null;
let overlay: SVGTextElement | null = null;

export const measureTool: EditorTool = {
  id: "measure",
  onDeactivate(ctx) {
    start = null;
    if (overlay?.parentNode) overlay.remove();
    overlay = null;
    ctx.requestRedraw();
  },
  onPointerDown(e, ctx) {
    const world = ctx.screenToWorld(e.clientX, e.clientY);
    if (!start) {
      start = world;
      return;
    }
    const len = distanceBetween(start, world);
    if (overlay?.parentNode) overlay.remove();
    const svg = ctx.svg;
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", String((start.x + world.x) / 2));
    text.setAttribute("y", String((start.y + world.y) / 2 - 8));
    text.setAttribute("font-size", "12");
    text.setAttribute("fill", "#017eba");
    text.textContent = `${len.toFixed(1)} cm`;
    svg.appendChild(text);
    overlay = text;
    start = null;
  },
  onPointerMove(e, ctx) {
    if (!start) return;
    const world = ctx.screenToWorld(e.clientX, e.clientY);
    const edge = pickEdge(ctx.doc, world, ctx.scale);
    if (overlay?.parentNode) overlay.remove();
    const len = distanceBetween(start, world);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", String((start.x + world.x) / 2));
    text.setAttribute("y", String((start.y + world.y) / 2 - 8));
    text.setAttribute("font-size", "12");
    text.setAttribute("fill", "#017eba");
    text.textContent = `${len.toFixed(1)} cm`;
    ctx.svg.appendChild(text);
    overlay = text;
  },
  onPointerUp() {},
};
