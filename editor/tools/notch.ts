import { nextId } from "../document.js";
import { pickEdge } from "../canvas/hit-test.js";
import type { EditorTool } from "./types.js";
import type { NotchAnnotation } from "../types.js";

export const notchTool: EditorTool = {
  id: "notch",
  onPointerDown(e, ctx) {
    const world = ctx.screenToWorld(e.clientX, e.clientY);
    const edge = pickEdge(ctx.doc, world, ctx.scale);
    if (!edge) return;
    const piece = ctx.doc.pieces.find((p) => p.id === edge.pieceId);
    if (!piece) return;
    const notch: NotchAnnotation = {
      id: nextId("notch"),
      pathId: edge.pathId,
      edgeIndex: edge.edgeIndex,
      t: edge.t,
      side: "out",
      depthCm: 0.5,
    };
    piece.annotations.push(notch);
    ctx.doc.meta.editState = "dirty";
    ctx.doc.manualEditRevision += 1;
    ctx.onDocumentChange();
    ctx.requestRedraw();
  },
  onPointerMove() {},
  onPointerUp() {},
};
