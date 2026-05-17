import { nextId } from "../document.js";
import { pickPiece } from "../canvas/hit-test.js";
import type { EditorTool } from "./types.js";
import type { GrainlineAnnotation } from "../types.js";

let drawing = false;
let pieceId: string | null = null;
let from: { x: number; y: number } | null = null;

export const grainlineTool: EditorTool = {
  id: "grainline",
  onDeactivate() {
    drawing = false;
    pieceId = null;
    from = null;
  },
  onPointerDown(e, ctx) {
    const world = ctx.screenToWorld(e.clientX, e.clientY);
    const pid = pickPiece(ctx.doc, world);
    if (!pid) return;
    const piece = ctx.doc.pieces.find((p) => p.id === pid);
    if (!piece) return;
    pieceId = pid;
    from = { x: world.x - piece.layout.x, y: world.y - piece.layout.y };
    drawing = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  },
  onPointerMove(e, ctx) {
    if (!drawing || !pieceId || !from) return;
    ctx.requestRedraw();
  },
  onPointerUp(e, ctx) {
    if (!drawing || !pieceId || !from) return;
    const piece = ctx.doc.pieces.find((p) => p.id === pieceId);
    if (!piece) return;
    const world = ctx.screenToWorld(e.clientX, e.clientY);
    const to = { x: world.x - piece.layout.x, y: world.y - piece.layout.y };
    piece.annotations = piece.annotations.filter((a) => !("from" in a && "to" in a));
    const grain: GrainlineAnnotation = {
      id: nextId("grain"),
      from: { ...from },
      to,
    };
    piece.annotations.push(grain);
    ctx.doc.meta.editState = "dirty";
    ctx.doc.manualEditRevision += 1;
    ctx.onDocumentChange();
    drawing = false;
    pieceId = null;
    from = null;
    ctx.requestRedraw();
  },
};
