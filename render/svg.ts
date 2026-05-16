import type { DraftResult, PatternPiece, Point2 } from "../engine/types.js";

function fmt(p: Point2): string {
  return `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
}

function samePoint(a: Point2, b: Point2): boolean {
  return Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.y - b.y) < 1e-6;
}

export function pieceToSvgPath(piece: PatternPiece): string {
  const cmds: string[] = [];
  let pen: Point2 | null = null;
  for (const seg of piece.paths) {
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
      cmds.push(
        `C ${fmt(seg.cp1)} ${fmt(seg.cp2)} ${fmt(seg.to)}`
      );
      pen = seg.to;
    }
  }
  return cmds.join(" ");
}

export function renderDraftToSvg(draftResult: DraftResult): string {
  const { pieces, bounds } = draftResult;
  const paths = pieces
    .map((piece) => {
      const d = pieceToSvgPath(piece);
      if (!d) return "";
      return `<path d="${d}" fill="none" stroke="#111" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`;
    })
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="0 0 ${bounds.width} ${bounds.height}">${paths}</svg>`;
}
