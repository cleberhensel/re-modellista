import { cloneDocument, insertNodeOnEdge } from "../document.js";
import { pickEdge } from "../canvas/hit-test.js";
import type { EditorTool } from "./types.js";

export const addNodeTool: EditorTool = {
  id: "add-node",
  onPointerDown(e, ctx) {
    const world = ctx.screenToWorld(e.clientX, e.clientY);
    const edge = pickEdge(ctx.doc, world, ctx.scale);
    if (!edge) return;
    const snap = cloneDocument(ctx.doc);
    const nodeId = insertNodeOnEdge(
      ctx.doc,
      edge.pieceId,
      edge.pathId,
      edge.edgeIndex,
      edge.t
    );
    if (nodeId) {
      ctx.undoStack.push(snap);
      ctx.setSelection({
        kind: "node",
        pieceId: edge.pieceId,
        pathId: edge.pathId,
        nodeId,
      });
      ctx.onDocumentChange();
      ctx.requestRedraw();
    }
  },
  onPointerMove() {},
  onPointerUp() {},
};
