import { DEFAULT_PX_PER_CM } from "../engine/constants.js";
import type { DraftResult, PathSegment, PatternPiece, Point2 } from "../engine/types.js";
import { layoutPieces } from "./layout.js";
import { CUT_MARKER_VIEW_OUTSET_PX, cutMarkersSvg } from "./cut-markers.js";
import {
  DEFAULT_SEAM_ALLOWANCE_CM,
  seamAllowanceSegments,
} from "./seam-allowance.js";

export interface RenderOptions {
  seamAllowanceCm?: number;
  pxPerCm?: number;
}

function fmt(p: Point2): string {
  return `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
}

function samePoint(a: Point2, b: Point2): boolean {
  return Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.y - b.y) < 1e-6;
}

function segmentsToPathD(segments: PathSegment[]): string {
  const cmds: string[] = [];
  let pen: Point2 | null = null;
  for (const seg of segments) {
    if (seg.type === "move") {
      cmds.push(`M ${fmt(seg.to)}`);
      pen = seg.to;
    } else if (seg.type === "line") {
      if (pen === null || !samePoint(pen, seg.from)) {
        cmds.push(`M ${fmt(seg.from)}`);
      }
      cmds.push(`L ${fmt(seg.to)}`);
      pen = seg.to;
    } else if (seg.type === "cubic") {
      if (pen === null || !samePoint(pen, seg.from)) {
        cmds.push(`M ${fmt(seg.from)}`);
      }
      cmds.push(`C ${fmt(seg.cp1)} ${fmt(seg.cp2)} ${fmt(seg.to)}`);
      pen = seg.to;
    }
  }
  return cmds.join(" ");
}

function isDashed(seg: PathSegment): boolean {
  return (seg.type === "line" || seg.type === "cubic") && !!seg.dash;
}

export function pieceToSvgPath(piece: PatternPiece): string {
  return segmentsToPathD(piece.paths.filter((s) => !isDashed(s)));
}

function pieceLabel(id: string): string {
  const labels: Record<string, string> = {
    "blouse-front": "Frente",
    "blouse-back": "Costas",
    sleeve: "Manga",
    "skirt-front": "Saia frente",
    "skirt-back": "Saia costas",
    "pant-front": "Calça frente",
    "pant-back": "Calça costas",
    "collar-stand": "Pé gola",
    "collar-fall": "Aba gola",
    cuff: "Punho",
    waistband: "Cós",
    "chest-pocket": "Bolso",
    placket: "Carcela",
  };
  return labels[id] ?? id;
}

function renderPieceSvg(
  piece: PatternPiece,
  forPrint = false,
  options: RenderOptions = {}
): string {
  const solid = piece.paths.filter((s) => !isDashed(s));
  const construction = piece.paths.filter((s) => isDashed(s));
  const allowanceCm = options.seamAllowanceCm ?? DEFAULT_SEAM_ALLOWANCE_CM;
  const pxPerCm = options.pxPerCm ?? DEFAULT_PX_PER_CM;
  const seamAllowance = seamAllowanceSegments(solid, allowanceCm, pxPerCm);
  const solidD = segmentsToPathD(solid);
  const constructionD = segmentsToPathD(construction);
  const seamD = segmentsToPathD(seamAllowance);
  let minX = Infinity;
  let minY = Infinity;
  for (const seg of piece.paths) {
    const pts =
      seg.type === "move"
        ? [seg.to]
        : seg.type === "line"
          ? [seg.from, seg.to]
          : [seg.from, seg.cp1, seg.cp2, seg.to];
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
    }
  }
  const labelX = Number.isFinite(minX) ? minX : 0;
  const labelY = Number.isFinite(minY) ? Math.max(minY - 8, 10) : 10;
  const solidStroke = forPrint
    ? 'stroke="#000" stroke-width="1.5"'
    : 'stroke="#111" stroke-width="1.5" vector-effect="non-scaling-stroke"';
  const dashedStroke = forPrint
    ? 'stroke="#666" stroke-width="1" stroke-dasharray="8 5"'
    : 'stroke="#6b7280" stroke-width="1" stroke-dasharray="8 5" vector-effect="non-scaling-stroke"';
  const seamStroke = forPrint
    ? 'stroke="#444" stroke-width="1" stroke-dasharray="8 10"'
    : 'stroke="#52525b" stroke-width="1" stroke-dasharray="8 10" vector-effect="non-scaling-stroke"';
  const parts: string[] = [
    `<g class="piece" data-piece="${piece.id}">`,
    `<text x="${labelX.toFixed(2)}" y="${labelY.toFixed(2)}" font-size="10" font-family="system-ui,sans-serif" fill="#000">${pieceLabel(piece.id)}</text>`,
  ];
  if (seamD) {
    parts.push(`<path d="${seamD}" fill="none" ${seamStroke} class="seam-allowance"/>`);
    const markers = cutMarkersSvg(seamAllowance, forPrint);
    if (markers) {
      parts.push(markers);
    }
  }
  if (solidD) {
    parts.push(`<path d="${solidD}" fill="none" ${solidStroke}/>`);
  }
  if (constructionD) {
    parts.push(`<path d="${constructionD}" fill="none" ${dashedStroke}/>`);
  }
  parts.push("</g>");
  return parts.join("\n");
}

export function renderPieceToPrintSvg(
  piece: PatternPiece,
  pageWidth: number,
  pageHeight: number,
  options: RenderOptions = {}
): string {
  const body = renderPieceSvg(piece, true, options);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}">${body}</svg>`;
}

export function renderDraftToSvg(
  draftResult: DraftResult,
  options: RenderOptions = {}
): string {
  const drawable = draftResult.pieces.filter((p) => p.paths.length > 0);
  const { pieces, bounds } = layoutPieces(drawable, {
    productId: draftResult.productId,
    seamAllowanceCm: options.seamAllowanceCm ?? DEFAULT_SEAM_ALLOWANCE_CM,
    pxPerCm: options.pxPerCm,
  });
  const body = pieces.map((piece) => renderPieceSvg(piece, false, options)).join("\n");
  const pad = CUT_MARKER_VIEW_OUTSET_PX;
  const w = bounds.width + pad;
  const h = bounds.height + pad;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${-pad} ${-pad} ${w} ${h}">${body}</svg>`;
}
