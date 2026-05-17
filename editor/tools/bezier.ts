import { cloneDocument } from "../document.js";
import { pickNode } from "../canvas/hit-test.js";
import type { EditorTool } from "./types.js";

let dragHandle: "in" | "out" | null = null;
let dragSnapshot: ReturnType<typeof cloneDocument> | null = null;

export const bezierTool: EditorTool = {
  id: "bezier",
  onDeactivate() {
    dragHandle = null;
    dragSnapshot = null;
  },
  onPointerDown(e, ctx) {
    const world = ctx.screenToWorld(e.clientX, e.clientY);
    const nodePick = pickNode(ctx.doc, world, ctx.scale);
    if (!nodePick) return;
    const piece = ctx.doc.pieces.find((p) => p.id === nodePick.pieceId);
    const path = piece?.paths.find((p) => p.id === nodePick.pathId);
    const node = path?.nodes.find((n) => n.id === nodePick.nodeId);
    if (!piece || !node) return;
    const wx = world.x - piece.layout.x;
    const wy = world.y - piece.layout.y;
    const dIn = node.handleIn
      ? Math.hypot(node.handleIn.x - wx, node.handleIn.y - wy)
      : Infinity;
    const dOut = node.handleOut
      ? Math.hypot(node.handleOut.x - wx, node.handleOut.y - wy)
      : Infinity;
    if (dIn < 12 / ctx.scale) {
      dragHandle = "in";
    } else if (dOut < 12 / ctx.scale) {
      dragHandle = "out";
    } else {
      return;
    }
    ctx.setSelection({
      kind: "node",
      pieceId: nodePick.pieceId,
      pathId: nodePick.pathId,
      nodeId: nodePick.nodeId,
    });
    dragSnapshot = cloneDocument(ctx.doc);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  },
  onPointerMove(e, ctx) {
    if (!dragHandle || ctx.selection.kind !== "node") return;
    const world = ctx.screenToWorld(e.clientX, e.clientY);
    const piece = ctx.doc.pieces.find((p) => p.id === ctx.selection.pieceId);
    if (!piece) return;
    const lx = world.x - piece.layout.x;
    const ly = world.y - piece.layout.y;
    const path = piece.paths.find((p) => p.id === ctx.selection.pathId);
    const node = path?.nodes.find((n) => n.id === ctx.selection.nodeId);
    if (!node) return;
    if (dragHandle === "in") {
      node.handleIn = { x: lx, y: ly };
    } else {
      node.handleOut = { x: lx, y: ly };
    }
    const edgeIdx = path!.nodes.indexOf(node);
    if (edgeIdx >= 0) path!.segmentKinds[edgeIdx] = "cubic";
    ctx.requestRedraw();
  },
  onPointerUp(_e, ctx) {
    if (dragHandle && dragSnapshot) {
      ctx.undoStack.push(dragSnapshot);
      ctx.doc.manualEditRevision = dragSnapshot.manualEditRevision + 1;
      ctx.doc.meta.editState = "dirty";
      ctx.onDocumentChange();
    }
    dragHandle = null;
    dragSnapshot = null;
  },
};
