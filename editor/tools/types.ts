import type { PatternDocument } from "../types.js";
import type { Selection } from "../selection.js";
import type { ViewportState } from "../canvas/viewport.js";
import type { UndoStack } from "../undo.js";

export interface ToolContext {
  doc: PatternDocument;
  selection: Selection;
  setSelection: (sel: Selection) => void;
  viewport: ViewportState;
  svg: SVGSVGElement;
  scale: number;
  undoStack: UndoStack;
  onDocumentChange: () => void;
  requestRedraw: () => void;
  screenToWorld: (clientX: number, clientY: number) => { x: number; y: number };
}

export interface EditorTool {
  id: string;
  onActivate?(ctx: ToolContext): void;
  onDeactivate?(ctx: ToolContext): void;
  onPointerDown(e: PointerEvent, ctx: ToolContext): void;
  onPointerMove(e: PointerEvent, ctx: ToolContext): void;
  onPointerUp(e: PointerEvent, ctx: ToolContext): void;
}
