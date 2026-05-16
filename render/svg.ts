import type { DraftResult, PathSegment, PatternPiece, Point2 } from "../engine/types.js";
import { layoutPieces } from "./layout.js";

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

function renderPieceSvg(piece: PatternPiece): string {
  const solid = piece.paths.filter((s) => !isDashed(s));
  const dashed = piece.paths.filter((s) => isDashed(s));
  const solidD = segmentsToPathD(solid);
  const dashedD = segmentsToPathD(dashed);
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
  const parts: string[] = [
    `<g class="piece" data-piece="${piece.id}">`,
    `<text x="${labelX.toFixed(2)}" y="${labelY.toFixed(2)}" class="piece-label">${pieceLabel(piece.id)}</text>`,
  ];
  if (solidD) {
    parts.push(
      `<path d="${solidD}" fill="none" stroke="#111" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`
    );
  }
  if (dashedD) {
    parts.push(
      `<path d="${dashedD}" fill="none" stroke="#6b7280" stroke-width="1" stroke-dasharray="8 5" vector-effect="non-scaling-stroke"/>`
    );
  }
  parts.push("</g>");
  return parts.join("\n");
}

export function renderDraftToSvg(draftResult: DraftResult): string {
  const drawable = draftResult.pieces.filter((p) => p.paths.length > 0);
  const { pieces, bounds } = layoutPieces(drawable, {
    productId: draftResult.productId,
  });
  const body = pieces.map((piece) => renderPieceSvg(piece)).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="0 0 ${bounds.width} ${bounds.height}">${body}</svg>`;
}
