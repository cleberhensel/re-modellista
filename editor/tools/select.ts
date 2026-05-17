import { cloneDocument } from "../document.js";
import { pick, pickNode } from "../canvas/hit-test.js";
import type { EditorTool, ToolContext } from "./types.js";

let dragNodeId: string | null = null;
let dragPieceId: string | null = null;
let dragPathId: string | null = null;
let dragSnapshot: ReturnType<typeof cloneDocument> | null = null;
let didMove = false;

export const selectTool: EditorTool = {
  id: "select",
  onDeactivate() {
    dragNodeId = null;
    dragSnapshot = null;
    didMove = false;
  },
  onPointerDown(e, ctx) {
    const world = ctx.screenToWorld(e.clientX, e.clientY);
    const nodePick = pickNode(ctx.doc, world, ctx.scale);
    if (nodePick) {
      ctx.setSelection({
        kind: "node",
        pieceId: nodePick.pieceId,
        pathId: nodePick.pathId,
        nodeId: nodePick.nodeId,
      });
      dragNodeId = nodePick.nodeId;
      dragPieceId = nodePick.pieceId;
      dragPathId = nodePick.pathId;
      dragSnapshot = cloneDocument(ctx.doc);
      didMove = false;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      return;
    }
    const hit = pick(ctx.doc, world, ctx.scale);
    if (hit && "nodeId" in hit) return;
    if (hit && "edgeIndex" in hit) {
      ctx.setSelection({
        kind: "edge",
        pieceId: hit.pieceId,
        pathId: hit.pathId,
        edgeIndex: hit.edgeIndex,
      });
      return;
    }
    if (hit && "pieceId" in hit && !("pathId" in hit)) {
      ctx.setSelection({ kind: "piece", pieceId: hit.pieceId });
      return;
    }
    ctx.setSelection({ kind: "none" });
  },
  onPointerMove(e, ctx) {
    if (!dragNodeId || !dragPieceId || !dragPathId) return;
    const world = ctx.screenToWorld(e.clientX, e.clientY);
    const piece = ctx.doc.pieces.find((p) => p.id === dragPieceId);
    const path = piece?.paths.find((p) => p.id === dragPathId);
    const node = path?.nodes.find((n) => n.id === dragNodeId);
    if (!piece || !node) return;
    const lx = world.x - piece.layout.x;
    const ly = world.y - piece.layout.y;
    if (Math.hypot(lx - node.x, ly - node.y) > 0.01) didMove = true;
    const dx = lx - node.x;
    const dy = ly - node.y;
    node.x = lx;
    node.y = ly;
    if (node.handleIn) {
      node.handleIn = { x: node.handleIn.x + dx, y: node.handleIn.y + dy };
    }
    if (node.handleOut) {
      node.handleOut = { x: node.handleOut.x + dx, y: node.handleOut.y + dy };
    }
    ctx.requestRedraw();
  },
  onPointerUp(_e, ctx) {
    if (dragNodeId && didMove && dragSnapshot) {
      ctx.undoStack.push(dragSnapshot);
      ctx.doc.manualEditRevision = dragSnapshot.manualEditRevision + 1;
      ctx.doc.meta.editState = "dirty";
      ctx.onDocumentChange();
    }
    dragNodeId = null;
    dragSnapshot = null;
    didMove = false;
  },
};
