import type { PatternDocument } from "../types.js";
import type { Selection } from "../selection.js";
import { UndoStack } from "../undo.js";
import {
  createViewport,
  fitToDocument,
  screenToWorld,
  viewportTransform,
  zoomAt,
  type ViewportState,
} from "./viewport.js";
import { renderDocumentSvg } from "./render.js";
import { selectTool } from "../tools/select.js";
import { addNodeTool } from "../tools/add-node.js";
import { deleteNodeTool } from "../tools/delete-node.js";
import { panTool, handleWheel } from "../tools/pan-zoom.js";
import { bezierTool } from "../tools/bezier.js";
import { notchTool } from "../tools/notch.js";
import { grainlineTool } from "../tools/grainline.js";
import { measureTool } from "../tools/measure.js";
import { movePieceTool } from "../tools/move-piece.js";
import type { EditorTool, ToolContext } from "../tools/types.js";
import { documentBounds } from "../document.js";
import { deleteSelectedNode } from "../tools/delete-node.js";

const TOOLS: Record<string, EditorTool> = {
  select: selectTool,
  pan: panTool,
  "add-node": addNodeTool,
  "delete-node": deleteNodeTool,
  bezier: bezierTool,
  notch: notchTool,
  grainline: grainlineTool,
  measure: measureTool,
  "move-piece": movePieceTool,
};

export class CanvasController {
  private container: HTMLDivElement;
  private svg: SVGSVGElement | null = null;
  private viewportG: SVGGElement | null = null;
  private piecesG: SVGGElement | null = null;
  private doc: PatternDocument | null = null;
  private selection: Selection = { kind: "none" };
  private viewport: ViewportState = createViewport();
  private activeTool: EditorTool = selectTool;
  readonly undoStack = new UndoStack();
  private onChange: (() => void) | null = null;
  private spacePan = false;
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundWheel: (e: WheelEvent) => void;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.boundKeyDown = (e) => this.onKeyDown(e);
    this.boundKeyUp = (e) => this.onKeyUp(e);
    this.boundWheel = (e) => this.onWheel(e);
  }

  setOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  mount(): void {
    this.container.innerHTML = "";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "editor-svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const b = this.doc ? documentBounds(this.doc) : { minX: 0, minY: 0, maxX: 800, maxY: 600 };
    const w = Math.max(400, b.maxX - b.minX + 80);
    const h = Math.max(400, b.maxY - b.minY + 80);
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.setAttribute("viewBox", `${b.minX - 40} ${b.minY - 40} ${w} ${h}`);

    const viewportG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    viewportG.setAttribute("id", "editor-viewport");
    const piecesG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    piecesG.setAttribute("data-layer", "pieces");
    viewportG.appendChild(piecesG);
    svg.appendChild(viewportG);

    this.container.appendChild(svg);
    this.container.classList.add("editor-active");
    this.container.addEventListener("wheel", this.boundWheel, {
      passive: false,
      capture: true,
    });
    this.svg = svg;
    this.viewportG = viewportG;
    this.piecesG = piecesG;

    svg.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    svg.addEventListener("pointermove", (e) => this.onPointerMove(e));
    svg.addEventListener("pointerup", (e) => this.onPointerUp(e));
    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("keyup", this.boundKeyUp);

    if (this.doc) {
      fitToDocument(this.viewport, this.doc, w, h);
    }
    this.redraw();
  }

  unmount(): void {
    window.removeEventListener("keydown", this.boundKeyDown);
    window.removeEventListener("keyup", this.boundKeyUp);
    this.container.removeEventListener("wheel", this.boundWheel, { capture: true });
    this.container.classList.remove("editor-active");
    if (this.svg) {
      this.svg.replaceWith(document.createComment("editor-unmounted"));
    }
    this.svg = null;
    this.viewportG = null;
    this.piecesG = null;
    this.container.innerHTML = "";
  }

  setDocument(doc: PatternDocument): void {
    this.doc = doc;
    if (this.svg && this.piecesG) {
      const rect = this.container.getBoundingClientRect();
      fitToDocument(this.viewport, doc, rect.width || 800, rect.height || 600);
      this.redraw();
    }
  }

  getDocument(): PatternDocument | null {
    return this.doc;
  }

  setActiveTool(toolId: string): void {
    const tool = TOOLS[toolId];
    if (!tool) return;
    if (this.activeTool.onDeactivate && this.doc) {
      this.activeTool.onDeactivate(this.toolContext());
    }
    this.activeTool = tool;
    if (this.activeTool.onActivate && this.doc) {
      this.activeTool.onActivate(this.toolContext());
    }
    if (this.svg) {
      this.svg.style.cursor =
        toolId === "pan" ? "grab" : toolId === "add-node" ? "crosshair" : "default";
    }
  }

  undo(): void {
    if (!this.doc) return;
    const prev = this.undoStack.undo(this.doc);
    if (prev) {
      this.doc = prev;
      this.onChange?.();
      this.redraw();
    }
  }

  redo(): void {
    if (!this.doc) return;
    const next = this.undoStack.redo(this.doc);
    if (next) {
      this.doc = next;
      this.onChange?.();
      this.redraw();
    }
  }

  zoomIn(): void {
    if (!this.svg) return;
    const rect = this.svg.getBoundingClientRect();
    zoomAt(this.viewport, 1.2, rect.width / 2, rect.height / 2);
    this.redraw();
  }

  zoomOut(): void {
    if (!this.svg) return;
    const rect = this.svg.getBoundingClientRect();
    zoomAt(this.viewport, 0.8, rect.width / 2, rect.height / 2);
    this.redraw();
  }

  fit(): void {
    if (!this.doc || !this.svg) return;
    const rect = this.container.getBoundingClientRect();
    fitToDocument(this.viewport, this.doc, rect.width || 800, rect.height || 600);
    this.redraw();
  }

  redraw(): void {
    if (!this.doc || !this.piecesG || !this.viewportG) return;
    this.viewportG.setAttribute("transform", viewportTransform(this.viewport));
    const activePieceId =
      this.selection.kind === "piece"
        ? this.selection.pieceId
        : this.selection.kind === "node"
          ? this.selection.pieceId
          : this.selection.kind === "edge"
            ? this.selection.pieceId
            : null;
    this.piecesG.innerHTML = renderDocumentSvg(this.doc, this.selection, activePieceId);
  }

  private toolContext(): ToolContext {
    if (!this.doc || !this.svg) {
      throw new Error("no_document");
    }
    return {
      doc: this.doc,
      selection: this.selection,
      setSelection: (sel) => {
        this.selection = sel;
        this.redraw();
      },
      viewport: this.viewport,
      svg: this.svg,
      scale: this.viewport.scale,
      undoStack: this.undoStack,
      onDocumentChange: () => this.onChange?.(),
      requestRedraw: () => this.redraw(),
      screenToWorld: (cx, cy) => screenToWorld(this.svg!, cx, cy, this.viewport),
    };
  }

  private onPointerDown(e: PointerEvent): void {
    if (!this.doc) return;
    const tool = this.spacePan ? panTool : this.activeTool;
    tool.onPointerDown(e, this.toolContext());
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.doc) return;
    const tool = this.spacePan ? panTool : this.activeTool;
    tool.onPointerMove(e, this.toolContext());
  }

  private onPointerUp(e: PointerEvent): void {
    if (!this.doc) return;
    const tool = this.spacePan ? panTool : this.activeTool;
    tool.onPointerUp(e, this.toolContext());
  }

  private onWheel(e: WheelEvent): void {
    if (!this.doc || !this.svg) return;
    handleWheel(e, this.toolContext(), this.svg);
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.code === "Space" && !this.isInputFocused()) {
      this.spacePan = true;
      e.preventDefault();
    }
    if (
      (e.key === "Delete" || e.key === "Backspace") &&
      !this.isInputFocused() &&
      this.doc
    ) {
      e.preventDefault();
      deleteSelectedNode(this.toolContext());
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    if (e.code === "Space") {
      this.spacePan = false;
    }
  }

  private isInputFocused(): boolean {
    const el = document.activeElement;
    return (
      el instanceof HTMLInputElement ||
      el instanceof HTMLSelectElement ||
      el instanceof HTMLTextAreaElement
    );
  }
}
