import { cloneDocument, insertNodeOnEdge } from "../document.js";
import { pickEdgeForInsert } from "../canvas/hit-test.js";
import { ensureNodeHandles } from "../curve-handles.js";
import type { ToolContext } from "./types.js";

export function insertNodeAtPointer(
  ctx: ToolContext,
  clientX: number,
  clientY: number
): boolean {
  const world = ctx.screenToWorld(clientX, clientY);
  const edge = pickEdgeForInsert(ctx.doc, world, ctx.scale);
  if (!edge) return false;
  const snap = cloneDocument(ctx.doc);
  const nodeId = insertNodeOnEdge(
    ctx.doc,
    edge.pieceId,
    edge.pathId,
    edge.edgeIndex,
    edge.t
  );
  if (!nodeId) return false;
  ctx.undoStack.push(snap);
  ctx.setSelection({
    kind: "node",
    pieceId: edge.pieceId,
    pathId: edge.pathId,
    nodeId,
  });
  const piece = ctx.doc.pieces.find((p) => p.id === edge.pieceId);
  const path = piece?.paths.find((p) => p.id === edge.pathId);
  const nodeIndex = path?.nodes.findIndex((n) => n.id === nodeId) ?? -1;
  if (path && nodeIndex >= 0) ensureNodeHandles(path, nodeIndex);
  ctx.onDocumentChange();
  ctx.requestRedraw();
  return true;
}
