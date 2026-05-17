import type { PathSegment, PatternPiece, Point2 } from "../../engine/types.js";
import type { EditablePath, EditablePiece } from "../types.js";
import {
  cfHemNode,
  cfNeckNode,
  resolveCfGuide,
  resolveDartFeet,
  sideBottomNode,
} from "./cut-geometry.js";
import { extractGrainX, parseDartFromDashed } from "./dart-geometry.js";
import {
  resolveGrainCenterX,
  resolveGrainLine,
} from "./grain-line.js";
import type {
  AnchorKey,
  ConstructionScalars,
  PieceConstructionState,
  ResolvedAnchors,
} from "./types.js";
import { CONSTRUCTION_PROFILES, guideOrderForCount } from "./profiles.js";

const BIND_EPS = 1.5;
const CF_EPS = 2;
const MAX_SPREAD_RATIO = 0.2;

function asPoint(v: unknown): Point2 | null {
  if (
    v &&
    typeof v === "object" &&
    "x" in v &&
    "y" in v &&
    typeof (v as Point2).x === "number" &&
    typeof (v as Point2).y === "number"
  ) {
    return v as Point2;
  }
  return null;
}

function dist(a: Point2, b: Point2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function nearestNodeId(
  cut: EditablePath,
  target: Point2,
  maxDist = BIND_EPS * 4
): string | undefined {
  let best: string | undefined;
  let bestD = maxDist;
  for (const n of cut.nodes) {
    const d = dist(n, target);
    if (d < bestD) {
      bestD = d;
      best = n.id;
    }
  }
  return best;
}

function cutPath(piece: EditablePiece): EditablePath | undefined {
  return piece.paths.find((p) => p.role === "cut");
}

function maxY(nodes: EditablePath["nodes"]): number {
  return Math.max(...nodes.map((n) => n.y));
}

function waistSideNode(cut: EditablePath): EditablePath["nodes"][0] | undefined {
  const topY = Math.min(...cut.nodes.map((n) => n.y));
  const top = cut.nodes.filter((n) => Math.abs(n.y - topY) < CF_EPS * 2);
  if (top.length === 0) return undefined;
  return top.reduce((a, b) => (a.x > b.x ? a : b));
}

function dartHipNode(cut: EditablePath, hemY: number): EditablePath["nodes"][0] | undefined {
  const x0 = Math.min(...cut.nodes.map((n) => n.x));
  const candidates = cut.nodes.filter(
    (n) => n.y < hemY - 1 && n.x > x0 + CF_EPS
  );
  if (candidates.length === 0) return undefined;
  return candidates.reduce((a, b) =>
    Math.abs(a.y - hemY * 0.55) < Math.abs(b.y - hemY * 0.55) ? a : b
  );
}

function hemSpan(cfX: number, sideX: number): number {
  const span = sideX - cfX;
  return Math.abs(span) < 0.01 ? 1 : span;
}

function isSkirtProfile(profileId: string): boolean {
  return profileId.startsWith("skirt");
}

export function extractScalars(
  draftPiece: PatternPiece,
  profileId: string,
  cut?: EditablePath
): ConstructionScalars {
  const parsed = parseDartFromDashed(draftPiece.paths);
  const pts = draftPiece.points ?? {};
  const grainHit = asPoint(pts.grainHit);
  const grainX =
    grainHit?.x ?? extractGrainX(draftPiece.paths, grainHit);

  if (!parsed) {
    return {
      dartOffsetFromSide: 0,
      dartSpreadRatio: 0,
      dartTopOffsetRatio: 0.15,
      dartApexOffsetFromHemY: 0,
      dartSpreadPx: 0,
      grainOffsetFromSide: 0,
      suppressDarts: true,
    };
  }

  const sideX =
    cut && sideBottomNode(cut)
      ? sideBottomNode(cut)!.x
      : asPoint(pts.sideBottom)?.x ?? parsed.hemCenter.x + parsed.spread * 2;
  const neckY =
    cut && cfNeckNode(cut) ? cfNeckNode(cut)!.y : parsed.apex.y;
  const hemY = parsed.hemCenter.y;
  const cfX =
    cut && cfHemNode(cut)
      ? cfHemNode(cut)!.x
      : parsed.hemCenter.x - parsed.spread;
  const span = hemSpan(cfX, sideX);
  const pieceHeight = Math.max(hemY - neckY, 1);

  let dartSpreadRatio = parsed.spread / Math.abs(span);
  if (!isSkirtProfile(profileId) && dartSpreadRatio > MAX_SPREAD_RATIO) {
    dartSpreadRatio = MAX_SPREAD_RATIO;
  }

  return {
    dartOffsetFromSide: sideX - parsed.apex.x,
    dartSpreadRatio,
    dartTopOffsetRatio: isSkirtProfile(profileId)
      ? 0
      : (hemY - parsed.apex.y) / pieceHeight,
    dartApexOffsetFromHemY: hemY - parsed.apex.y,
    dartSpreadPx: parsed.spread,
    grainOffsetFromSide: isSkirtProfile(profileId) ? 0 : sideX - grainX,
    suppressDarts: false,
  };
}

export function bindAnchors(
  piece: EditablePiece,
  draftPiece: PatternPiece,
  parsedDart?: ReturnType<typeof parseDartFromDashed>
): Partial<Record<AnchorKey, string>> {
  const cut = cutPath(piece);
  if (!cut) return {};
  const bindings: Partial<Record<AnchorKey, string>> = {};
  const pts = draftPiece.points ?? {};

  const neck = cfNeckNode(cut);
  const hem = cfHemNode(cut);
  const side = sideBottomNode(cut);
  if (neck) bindings.cf_neck = neck.id;
  if (hem) bindings.cf_hem = hem.id;
  if (side) bindings.side_bottom = side.id;

  const shoulderStart = asPoint(pts.shoulderStart);
  const shoulderEnd = asPoint(pts.shoulderEnd);
  const intersection = asPoint(pts.intersection);
  if (shoulderStart) {
    bindings.shoulder_start =
      nearestNodeId(cut, shoulderStart) ?? bindings.cf_neck;
  }
  if (shoulderEnd) {
    bindings.shoulder_end = nearestNodeId(cut, shoulderEnd, BIND_EPS * 8);
  }
  if (intersection) {
    bindings.intersection = nearestNodeId(cut, intersection);
  }

  const hemY = hem?.y ?? maxY(cut.nodes);
  if (parsedDart && draftPiece.id.startsWith("skirt")) {
    const apexId = nearestNodeId(cut, parsedDart.apex, BIND_EPS * 8);
    if (apexId) bindings.dart_hip = apexId;
  } else {
    const hip = dartHipNode(cut, hemY);
    if (hip) bindings.dart_hip = hip.id;
  }

  const waist = waistSideNode(cut);
  if (waist) bindings.waist_side = waist.id;

  return bindings;
}

function nodePoint(
  cut: EditablePath,
  bindings: Partial<Record<AnchorKey, string>>,
  key: AnchorKey,
  fallback?: Point2
): Point2 | null {
  const id = bindings[key];
  if (id) {
    const n = cut.nodes.find((node) => node.id === id);
    if (n) return { x: n.x, y: n.y };
  }
  return fallback ?? null;
}

function resolveSkirtDart(
  cfHemLive: Point2,
  sideBottom: Point2,
  scalars: ConstructionScalars
): Pick<
  ResolvedAnchors,
  | "dartCenterX"
  | "dartTopY"
  | "dartSpread"
  | "hemY"
  | "dartFootCenter"
  | "dartFootPlus"
  | "dartFootMinus"
> {
  const hemY = Math.max(cfHemLive.y, sideBottom.y);
  const dartCenterX = sideBottom.x - scalars.dartOffsetFromSide;
  const dartTopY = hemY - scalars.dartApexOffsetFromHemY;
  const dartSpread =
    scalars.dartSpreadPx > 0
      ? scalars.dartSpreadPx
      : Math.abs(hemSpan(cfHemLive.x, sideBottom.x)) * scalars.dartSpreadRatio;
  const feet = resolveDartFeet(cfHemLive, sideBottom, dartCenterX, dartSpread);
  return {
    hemY,
    dartCenterX,
    dartTopY,
    dartSpread,
    dartFootCenter: feet.center,
    dartFootPlus: feet.plus,
    dartFootMinus: feet.minus,
  };
}

function resolveBodiceDart(
  cfNeck: Point2,
  cfHemLive: Point2,
  sideBottom: Point2,
  scalars: ConstructionScalars
): Pick<
  ResolvedAnchors,
  | "dartCenterX"
  | "dartTopY"
  | "dartSpread"
  | "hemY"
  | "dartFootCenter"
  | "dartFootPlus"
  | "dartFootMinus"
> {
  const hemY = Math.max(cfHemLive.y, sideBottom.y);
  const span = hemSpan(cfHemLive.x, sideBottom.x);
  const pieceHeight = Math.max(hemY - cfNeck.y, 1);
  const dartCenterX = sideBottom.x - scalars.dartOffsetFromSide;
  const dartSpread = Math.abs(span) * scalars.dartSpreadRatio;
  const dartTopY = hemY - pieceHeight * scalars.dartTopOffsetRatio;
  const feet = resolveDartFeet(cfHemLive, sideBottom, dartCenterX, dartSpread);
  return {
    hemY,
    dartCenterX,
    dartTopY,
    dartSpread,
    dartFootCenter: feet.center,
    dartFootPlus: feet.plus,
    dartFootMinus: feet.minus,
  };
}

export function resolveAnchors(
  piece: EditablePiece,
  state: PieceConstructionState
): ResolvedAnchors | null {
  const cut = cutPath(piece);
  if (!cut) return null;
  const { scalars, anchorBindings } = state;

  const hemLive =
    nodePoint(cut, anchorBindings, "cf_hem") ?? cfHemNode(cut);
  const neckLive =
    nodePoint(cut, anchorBindings, "cf_neck") ?? cfNeckNode(cut);
  if (!hemLive || !neckLive) return null;

  const sideBottom =
    nodePoint(cut, anchorBindings, "side_bottom") ?? sideBottomNode(cut);
  if (!sideBottom) return null;

  const cfGuide = resolveCfGuide(neckLive, hemLive);
  const cfNeck = cfGuide.cf_neck;
  const cfHem = cfGuide.cf_hem;
  const cfHemLive = { x: hemLive.x, y: hemLive.y };

  const shoulderStart =
    nodePoint(cut, anchorBindings, "shoulder_start", cfNeck) ?? cfNeck;
  const shoulderEnd =
    nodePoint(cut, anchorBindings, "shoulder_end") ??
    nodePoint(cut, anchorBindings, "intersection") ??
    sideBottom;
  const intersection =
    nodePoint(cut, anchorBindings, "intersection") ?? shoulderStart;

  const dartHip = nodePoint(cut, anchorBindings, "dart_hip");

  let hemY: number;
  let dartCenterX: number;
  let dartTopY: number;
  let dartSpread: number;
  let dartFootCenter: Point2;
  let dartFootPlus: Point2;
  let dartFootMinus: Point2;

  if (state.profileId === "pant-back" && !scalars.suppressDarts) {
    const waist = nodePoint(cut, anchorBindings, "waist_side") ?? sideBottom;
    const bodice = resolveBodiceDart(cfNeck, cfHemLive, waist, scalars);
    hemY = cfHem.y;
    dartCenterX = bodice.dartCenterX;
    dartTopY = waist.y;
    dartSpread = bodice.dartSpread;
    dartFootCenter = bodice.dartFootCenter;
    dartFootPlus = bodice.dartFootPlus;
    dartFootMinus = bodice.dartFootMinus;
  } else if (state.profileId.startsWith("skirt") && !scalars.suppressDarts) {
    const skirt = resolveSkirtDart(cfHemLive, sideBottom, scalars);
    hemY = skirt.hemY;
    dartCenterX = skirt.dartCenterX;
    dartTopY = skirt.dartTopY;
    dartSpread = skirt.dartSpread;
    dartFootCenter = skirt.dartFootCenter;
    dartFootPlus = skirt.dartFootPlus;
    dartFootMinus = skirt.dartFootMinus;
  } else if (!scalars.suppressDarts) {
    const bodice = resolveBodiceDart(cfNeck, cfHemLive, sideBottom, scalars);
    hemY = bodice.hemY;
    dartCenterX = bodice.dartCenterX;
    dartTopY = bodice.dartTopY;
    dartSpread = bodice.dartSpread;
    dartFootCenter = bodice.dartFootCenter;
    dartFootPlus = bodice.dartFootPlus;
    dartFootMinus = bodice.dartFootMinus;
  } else {
    hemY = cfHem.y;
    dartCenterX = cfHem.x;
    dartTopY = cfHem.y;
    dartSpread = 0;
    dartFootCenter = cfHem;
    dartFootPlus = cfHem;
    dartFootMinus = cfHem;
  }

  const hasGrainGuide = piece.paths.some((p) => p.guideKind === "grain");
  let grainCenterX = 0;
  let grainTop = { x: 0, y: cfNeck.y };
  let grainBottom = { x: 0, y: hemY };
  if (hasGrainGuide && scalars.grainOffsetFromSide > 0) {
    grainCenterX = resolveGrainCenterX(
      sideBottom.x,
      scalars.grainOffsetFromSide
    );
    const grainLine = resolveGrainLine(
      cut,
      grainCenterX,
      cfHemLive,
      sideBottom
    );
    grainTop = grainLine?.top ?? { x: grainCenterX, y: cfNeck.y };
    grainBottom = grainLine?.bottom ?? { x: grainCenterX, y: hemY };
  }

  return {
    cf_neck: cfNeck,
    cf_hem: cfHem,
    side_bottom: sideBottom,
    shoulder_start: shoulderStart,
    shoulder_end: shoulderEnd,
    intersection,
    dart_hip: dartHip ?? undefined,
    waist_side: nodePoint(cut, anchorBindings, "waist_side") ?? undefined,
    hemY,
    dartCenterX,
    dartTopY,
    dartSpread,
    dartFootCenter,
    dartFootPlus,
    dartFootMinus,
    grainCenterX,
    grainTop,
    grainBottom,
  };
}

export function buildImpactMap(
  profileId: string,
  anchorBindings: Partial<Record<AnchorKey, string>>,
  guideKinds: import("./types.js").GuideKind[]
): Record<string, GuideKind[]> {
  const profile = CONSTRUCTION_PROFILES[profileId];
  const map: Record<string, Set<GuideKind>> = {};
  const add = (nodeId: string | undefined, kind: import("./types.js").GuideKind) => {
    if (!nodeId) return;
    if (!map[nodeId]) map[nodeId] = new Set();
    map[nodeId].add(kind);
  };

  if (!profile) return {};

  for (const kind of guideKinds) {
    const deps = profile.guideDependsOn[kind];
    if (!deps) continue;
    for (const anchor of deps) {
      add(anchorBindings[anchor], kind);
    }
  }

  const out: Record<string, GuideKind[]> = {};
  for (const [nodeId, kinds] of Object.entries(map)) {
    out[nodeId] = [...kinds];
  }
  return out;
}

export function attachConstruction(
  editable: EditablePiece,
  draftPiece: PatternPiece
): void {
  const profile = CONSTRUCTION_PROFILES[draftPiece.id];
  if (!profile) return;

  const guides = editable.paths.filter((p) => p.role === "guide");
  if (guides.length === 0) return;

  const cut = cutPath(editable);
  const kinds = guideOrderForCount(draftPiece.id, guides.length);
  guides.forEach((guide, i) => {
    guide.guideKind = kinds[i];
  });

  const parsedDart = parseDartFromDashed(draftPiece.paths);
  const scalars = extractScalars(draftPiece, draftPiece.id, cut);
  const anchorBindings = bindAnchors(editable, draftPiece, parsedDart);
  const dartKinds = new Set(["dart_center", "dart_plus", "dart_minus"]);
  const impactKinds = scalars.suppressDarts
    ? kinds.filter((k) => !dartKinds.has(k))
    : kinds;
  const impactByNode = buildImpactMap(
    draftPiece.id,
    anchorBindings,
    impactKinds
  );

  editable.construction = {
    profileId: draftPiece.id,
    scalars,
    anchorBindings,
    impactByNode,
  };
}
