import { cloneDocument } from "../document.js";
import { pickPiece } from "../canvas/hit-test.js";
import type { EditorTool } from "./types.js";

let dragging = false;
let pieceId: string | null = null;
let lastWorld: { x: number; y: number } | null = null;
let snapshot: ReturnType<typeof cloneDocument> | null = null;

export const movePieceTool: EditorTool = {
  id: "move-piece",
  onDeactivate() {
    dragging = false;
    pieceId = null;
    lastWorld = null;
    snapshot = null;
  },
  onPointerDown(e, ctx) {
    const world = ctx.screenToWorld(e.clientX, e.clientY);
    const pid =
      ctx.selection.kind === "piece"
        ? ctx.selection.pieceId
        : pickPiece(ctx.doc, world);
    if (!pid) return;
    pieceId = pid;
    lastWorld = world;
    snapshot = cloneDocument(ctx.doc);
    dragging = true;
    ctx.setSelection({ kind: "piece", pieceId: pid });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  },
  onPointerMove(e, ctx) {
    if (!dragging || !pieceId || !lastWorld) return;
    const world = ctx.screenToWorld(e.clientX, e.clientY);
    const piece = ctx.doc.pieces.find((p) => p.id === pieceId);
    if (piece) {
      piece.layout.x += world.x - lastWorld.x;
      piece.layout.y += world.y - lastWorld.y;
      piece.layoutManual = true;
    }
    lastWorld = world;
    ctx.requestRedraw();
  },
  onPointerUp(_e, ctx) {
    if (dragging && snapshot) {
      ctx.undoStack.push(snapshot);
      ctx.doc.manualEditRevision = snapshot.manualEditRevision + 1;
      ctx.doc.meta.editState = "dirty";
      ctx.onDocumentChange();
    }
    dragging = false;
    pieceId = null;
    lastWorld = null;
    snapshot = null;
  },
};
