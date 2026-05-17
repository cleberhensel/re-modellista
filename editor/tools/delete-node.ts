import { cloneDocument, removeNode } from "../document.js";
import type { EditorTool } from "./types.js";

export function deleteSelectedNode(ctx: import("./types.js").ToolContext): boolean {
  if (ctx.selection.kind !== "node") return false;
  const snap = cloneDocument(ctx.doc);
  const ok = removeNode(
    ctx.doc,
    ctx.selection.pieceId,
    ctx.selection.pathId,
    ctx.selection.nodeId
  );
  if (ok) {
    ctx.undoStack.push(snap);
    ctx.setSelection({ kind: "none" });
    ctx.onDocumentChange();
    ctx.requestRedraw();
  }
  return ok;
}

export const deleteNodeTool: EditorTool = {
  id: "delete-node",
  onPointerDown(_e, ctx) {
    deleteSelectedNode(ctx);
  },
  onPointerMove() {},
  onPointerUp() {},
};
