import { syncConstructionGuides } from "../construction/sync.js";
import { cloneDocument } from "../document.js";
import { pick, pickHandle, pickNode } from "../canvas/hit-test.js";
import { ensureNodeHandles, markCubicForHandle } from "../curve-handles.js";
import type { EditorTool, ToolContext } from "./types.js";

let dragNodeId: string | null = null;
let dragPieceId: string | null = null;
let dragPathId: string | null = null;
let dragHandle: "in" | "out" | null = null;
let dragSnapshot: ReturnType<typeof cloneDocument> | null = null;
let didMove = false;

function resetDrag(): void {
  dragNodeId = null;
  dragPieceId = null;
  dragPathId = null;
  dragHandle = null;
  dragSnapshot = null;
  didMove = false;
}

function selectNode(
  ctx: ToolContext,
  pieceId: string,
  pathId: string,
  nodeId: string
): void {
  ctx.setSelection({ kind: "node", pieceId, pathId, nodeId });
  const piece = ctx.doc.pieces.find((p) => p.id === pieceId);
  const path = piece?.paths.find((p) => p.id === pathId);
  const nodeIndex = path?.nodes.findIndex((n) => n.id === nodeId) ?? -1;
  if (path && nodeIndex >= 0) {
    ensureNodeHandles(path, nodeIndex);
    ctx.requestRedraw();
  }
}

export const selectTool: EditorTool = {
  id: "select",
  onDeactivate() {
    resetDrag();
  },
  onPointerDown(e, ctx) {
    const world = ctx.screenToWorld(e.clientX, e.clientY);
    const handlePick = pickHandle(ctx.doc, world, ctx.scale);
    if (handlePick) {
      selectNode(ctx, handlePick.pieceId, handlePick.pathId, handlePick.nodeId);
      dragHandle = handlePick.handle;
      dragNodeId = handlePick.nodeId;
      dragPieceId = handlePick.pieceId;
      dragPathId = handlePick.pathId;
      dragSnapshot = cloneDocument(ctx.doc);
      didMove = false;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      return;
    }
    const nodePick = pickNode(ctx.doc, world, ctx.scale);
    if (nodePick) {
      selectNode(ctx, nodePick.pieceId, nodePick.pathId, nodePick.nodeId);
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
    if (!dragPieceId || !dragPathId || !dragNodeId) return;
    const world = ctx.screenToWorld(e.clientX, e.clientY);
    const piece = ctx.doc.pieces.find((p) => p.id === dragPieceId);
    const path = piece?.paths.find((p) => p.id === dragPathId);
    const node = path?.nodes.find((n) => n.id === dragNodeId);
    if (!piece || !path || !node) return;
    const lx = world.x - piece.layout.x;
    const ly = world.y - piece.layout.y;

    if (dragHandle) {
      const nodeIndex = path.nodes.findIndex((n) => n.id === dragNodeId);
      if (nodeIndex < 0) return;
      const prev = dragHandle === "in" ? node.handleIn : node.handleOut;
      if (prev && Math.hypot(lx - prev.x, ly - prev.y) > 0.01) didMove = true;
      if (dragHandle === "in") {
        node.handleIn = { x: lx, y: ly };
      } else {
        node.handleOut = { x: lx, y: ly };
      }
      markCubicForHandle(path, nodeIndex, dragHandle);
      if (path.role === "cut") {
        syncConstructionGuides(piece, dragPathId, dragNodeId);
      }
      ctx.requestRedraw();
      return;
    }

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
    if (path.role === "cut") {
      syncConstructionGuides(piece, dragPathId, dragNodeId);
    }
    ctx.requestRedraw();
  },
  onPointerUp(_e, ctx) {
    if ((dragNodeId || dragHandle) && didMove && dragSnapshot) {
      ctx.undoStack.push(dragSnapshot);
      ctx.doc.manualEditRevision = dragSnapshot.manualEditRevision + 1;
      ctx.doc.meta.editState = "dirty";
      ctx.onDocumentChange();
    }
    resetDrag();
  },
};
