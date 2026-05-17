import type { EditablePiece } from "../types.js";
import type { GuideKind, ResolvedAnchors } from "./types.js";
import { resolveAnchors } from "./anchors.js";

const CF_EDGE_EPS = 2.5;
const SHOULDER_EPS = 3;

function cutPath(piece: EditablePiece) {
  return piece.paths.find((p) => p.role === "cut");
}

function guidePath(piece: EditablePiece, kind: GuideKind) {
  return piece.paths.find((p) => p.role === "guide" && p.guideKind === kind);
}

function setLine(
  path: { nodes: { x: number; y: number }[] },
  from: { x: number; y: number },
  to: { x: number; y: number }
) {
  if (path.nodes.length < 2) return;
  path.nodes[0]!.x = from.x;
  path.nodes[0]!.y = from.y;
  path.nodes[1]!.x = to.x;
  path.nodes[1]!.y = to.y;
}

function distToSegment(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-12) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const px = a.x + t * dx;
  const py = a.y + t * dy;
  return Math.hypot(p.x - px, p.y - py);
}

function inferGuideKinds(
  piece: EditablePiece,
  pathId: string,
  nodeId: string
): GuideKind[] {
  const state = piece.construction;
  if (!state) return [];

  const direct = state.impactByNode[nodeId];
  if (direct && direct.length > 0) return direct;

  const cut = cutPath(piece);
  if (!cut || pathId !== cut.id) return [];

  const node = cut.nodes.find((n) => n.id === nodeId);
  if (!node) return [];

  const kinds = new Set<GuideKind>();
  const x0 = Math.min(...cut.nodes.map((n) => n.x));
  const hemY = Math.max(...cut.nodes.map((n) => n.y));

  const isCfHem = nodeId === state.anchorBindings.cf_hem;
  const isCfNeck = nodeId === state.anchorBindings.cf_neck;
  const isSideBottom = nodeId === state.anchorBindings.side_bottom;

  if (isCfHem || isCfNeck || Math.abs(node.x - x0) < CF_EDGE_EPS) {
    kinds.add("cf_axis");
    kinds.add("grain");
  }

  if (isSideBottom) {
    kinds.add("grain");
  }

  if (isSideBottom && !state.scalars.suppressDarts) {
    kinds.add("dart_center");
    kinds.add("dart_plus");
    kinds.add("dart_minus");
  }

  if (isCfHem && !state.scalars.suppressDarts) {
    kinds.add("dart_plus");
    kinds.add("dart_minus");
    kinds.add("dart_center");
  }

  const anchors = resolveAnchors(piece, state);
  if (anchors) {
    const onShoulder =
      distToSegment(node, anchors.shoulder_start, anchors.intersection) <
        SHOULDER_EPS ||
      distToSegment(node, anchors.shoulder_start, anchors.shoulder_end) <
        SHOULDER_EPS;
    if (onShoulder) {
      if (state.profileId === "blouse-back") kinds.add("shoulder_line");
    }
  }

  if (state.profileId === "pant-back") {
    const topY = Math.min(...cut.nodes.map((n) => n.y));
    if (Math.abs(node.y - topY) < CF_EDGE_EPS) {
      kinds.add("dart_plus");
      kinds.add("dart_minus");
    }
  }

  const isWaistSide = nodeId === state.anchorBindings.waist_side;

  if (state.profileId.startsWith("skirt") && !state.scalars.suppressDarts) {
    if (isSideBottom || isCfHem || isWaistSide) {
      kinds.add("dart_center");
      kinds.add("dart_plus");
      kinds.add("dart_minus");
    }
  }

  return [...kinds];
}

function applyGuide(
  piece: EditablePiece,
  kind: GuideKind,
  anchors: ResolvedAnchors
): boolean {
  const path = guidePath(piece, kind);
  if (!path) return false;

  switch (kind) {
    case "cf_axis":
      setLine(path, anchors.cf_neck, anchors.cf_hem);
      return true;
    case "shoulder_line":
      setLine(path, anchors.shoulder_start, anchors.shoulder_end);
      return true;
    case "dart_center":
      setLine(
        path,
        { x: anchors.dartCenterX, y: anchors.dartTopY },
        anchors.dartFootCenter
      );
      return true;
    case "dart_plus":
      setLine(
        path,
        { x: anchors.dartCenterX, y: anchors.dartTopY },
        anchors.dartFootPlus
      );
      return true;
    case "dart_minus":
      setLine(
        path,
        { x: anchors.dartCenterX, y: anchors.dartTopY },
        anchors.dartFootMinus
      );
      return true;
    case "grain":
      setLine(path, anchors.grainTop, anchors.grainBottom);
      return true;
    default:
      return false;
  }
}

function applyPantDart(
  piece: EditablePiece,
  kind: "dart_plus" | "dart_minus",
  anchors: ResolvedAnchors,
  state: NonNullable<EditablePiece["construction"]>
): boolean {
  const path = guidePath(piece, kind);
  if (!path) return false;
  const y0 = anchors.dartTopY;
  const legDepth =
    (anchors.hemY - anchors.cf_neck.y) * state.scalars.dartTopOffsetRatio;
  const y1 = y0 + Math.max(legDepth, 0.5);
  const sign = kind === "dart_plus" ? 1 : -1;
  setLine(
    path,
    { x: anchors.dartCenterX, y: y0 },
    { x: anchors.dartCenterX + sign * anchors.dartSpread, y: y1 }
  );
  return true;
}

export function syncConstructionGuides(
  piece: EditablePiece,
  pathId: string,
  nodeId: string
): boolean {
  const state = piece.construction;
  if (!state) return false;

  const cut = cutPath(piece);
  if (!cut || pathId !== cut.id) return false;

  const kinds = inferGuideKinds(piece, pathId, nodeId);
  if (kinds.length === 0) return false;

  const anchors = resolveAnchors(piece, state);
  if (!anchors) return false;

  let changed = false;
  const dartKinds: GuideKind[] = ["dart_center", "dart_plus", "dart_minus"];
  const wantsDart = kinds.some((k) => dartKinds.includes(k));
  const unique = [
    ...new Set([
      ...kinds.filter((k) => !dartKinds.includes(k)),
      ...(wantsDart && !state.scalars.suppressDarts ? dartKinds : []),
    ]),
  ];
  for (const kind of unique) {
    if (
      (kind === "dart_center" ||
        kind === "dart_plus" ||
        kind === "dart_minus") &&
      state.scalars.suppressDarts
    ) {
      continue;
    }
    if (
      state.profileId === "pant-back" &&
      (kind === "dart_plus" || kind === "dart_minus")
    ) {
      if (applyPantDart(piece, kind, anchors, state)) {
        changed = true;
      }
      continue;
    }
    if (applyGuide(piece, kind, anchors)) changed = true;
  }
  return changed;
}
