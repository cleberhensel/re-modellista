import { describe, expect, it, vi } from "vitest";
import { createViewport } from "../canvas/viewport.js";
import { handleWheel } from "./pan-zoom.js";
import type { ToolContext } from "./types.js";
import { UndoStack } from "../undo.js";
import { createEmptyDocument } from "../document.js";

function mockCtx(viewport = createViewport()): ToolContext {
  let redraws = 0;
  return {
    doc: createEmptyDocument(),
    selection: { kind: "none" },
    setSelection: () => {},
    viewport,
    svg: document.createElementNS("http://www.w3.org/2000/svg", "svg"),
    scale: 1,
    undoStack: new UndoStack(),
    onDocumentChange: () => {},
    requestRedraw: () => {
      redraws += 1;
    },
    screenToWorld: () => ({ x: 0, y: 0 }),
  };
}

describe("handleWheel", () => {
  it("pans horizontally with shift", () => {
    const v = createViewport();
    const ctx = mockCtx(v);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "400");
    svg.setAttribute("height", "400");
    document.body.appendChild(svg);
    const e = new WheelEvent("wheel", {
      deltaY: 10,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(e, "shiftKey", { value: true });
    vi.spyOn(e, "preventDefault");
    handleWheel(e, ctx, svg);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(v.panX).toBe(-10);
    svg.remove();
  });

  it("pans vertically with alt", () => {
    const v = createViewport();
    const ctx = mockCtx(v);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    document.body.appendChild(svg);
    const e = new WheelEvent("wheel", {
      deltaY: 12,
      altKey: true,
      bubbles: true,
      cancelable: true,
    });
    handleWheel(e, ctx, svg);
    expect(v.panY).toBe(-12);
    svg.remove();
  });
});
