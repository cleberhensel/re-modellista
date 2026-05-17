import type { PatternDocument } from "../types.js";
import type { Selection } from "../selection.js";
import { editablePathToSegments } from "../adapters/path-to-segments.js";

function pathDFromNodes(
  piece: { layout: { x: number; y: number } },
  path: import("../types.js").EditablePath
): string {
  const segs = editablePathToSegments(path);
  const cmds: string[] = [];
  for (const seg of segs) {
    if (seg.type === "move") {
      cmds.push(
        `M ${(seg.to.x + piece.layout.x).toFixed(2)} ${(seg.to.y + piece.layout.y).toFixed(2)}`
      );
    } else if (seg.type === "line") {
      cmds.push(
        `L ${(seg.to.x + piece.layout.x).toFixed(2)} ${(seg.to.y + piece.layout.y).toFixed(2)}`
      );
    } else if (seg.type === "cubic") {
      cmds.push(
        `C ${(seg.cp1.x + piece.layout.x).toFixed(2)} ${(seg.cp1.y + piece.layout.y).toFixed(2)} ${(seg.cp2.x + piece.layout.x).toFixed(2)} ${(seg.cp2.y + piece.layout.y).toFixed(2)} ${(seg.to.x + piece.layout.x).toFixed(2)} ${(seg.to.y + piece.layout.y).toFixed(2)}`
      );
    }
  }
  if (path.closed && cmds.length > 0) cmds.push("Z");
  return cmds.join(" ");
}

export function renderDocumentSvg(
  doc: PatternDocument,
  selection: Selection,
  activePieceId: string | null
): string {
  const parts: string[] = [];
  for (const piece of doc.pieces) {
    const active = !activePieceId || activePieceId === piece.id;
    const opacity = active ? 1 : 0.85;
    parts.push(
      `<g class="editor-piece" data-piece-id="${piece.id}" opacity="${opacity}">`
    );
    for (const path of piece.paths) {
      const d = pathDFromNodes(piece, path);
      if (!d) continue;
      const stroke =
        path.role === "guide"
          ? "#6b7280"
          : path.role === "fold"
            ? "#6b7280"
            : "#111";
      const dash =
        path.role === "guide" || path.role === "fold"
          ? 'stroke-dasharray="8 5"'
          : "";
      parts.push(
        `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="1.5" vector-effect="non-scaling-stroke" ${dash}/>`
      );
    }
    parts.push(`<text x="${piece.layout.x + 4}" y="${piece.layout.y + 12}" font-size="10" fill="#000">${piece.label}</text>`);
    parts.push("</g>");
  }

  if (selection.kind === "edge") {
    const piece = doc.pieces.find((p) => p.id === selection.pieceId);
    const path = piece?.paths.find((p) => p.id === selection.pathId);
    if (piece && path) {
      const n = path.nodes.length;
      const i = selection.edgeIndex;
      const a = path.nodes[i % n]!;
      const b = path.nodes[(i + 1) % n]!;
      parts.push(
        `<line x1="${a.x + piece.layout.x}" y1="${a.y + piece.layout.y}" x2="${b.x + piece.layout.x}" y2="${b.y + piece.layout.y}" stroke="#017eba" stroke-width="2" vector-effect="non-scaling-stroke"/>`
      );
    }
  }

  if (selection.kind === "node") {
    const piece = doc.pieces.find((p) => p.id === selection.pieceId);
    const path = piece?.paths.find((p) => p.id === selection.pathId);
    const node = path?.nodes.find((n) => n.id === selection.nodeId);
    if (piece && node) {
      const cx = node.x + piece.layout.x;
      const cy = node.y + piece.layout.y;
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="5" fill="#017eba" stroke="#fff" stroke-width="1.5"/>`
      );
      if (node.handleIn) {
        parts.push(
          `<line x1="${cx}" y1="${cy}" x2="${node.handleIn.x + piece.layout.x}" y2="${node.handleIn.y + piece.layout.y}" stroke="#017eba" stroke-width="1" stroke-dasharray="4 3"/>`
        );
        parts.push(
          `<circle cx="${node.handleIn.x + piece.layout.x}" cy="${node.handleIn.y + piece.layout.y}" r="3" fill="#017eba"/>`
        );
      }
      if (node.handleOut) {
        parts.push(
          `<line x1="${cx}" y1="${cy}" x2="${node.handleOut.x + piece.layout.x}" y2="${node.handleOut.y + piece.layout.y}" stroke="#017eba" stroke-width="1" stroke-dasharray="4 3"/>`
        );
        parts.push(
          `<circle cx="${node.handleOut.x + piece.layout.x}" cy="${node.handleOut.y + piece.layout.y}" r="3" fill="#017eba"/>`
        );
      }
    }
  }

  for (const piece of doc.pieces) {
    for (const ann of piece.annotations) {
      if ("from" in ann && "to" in ann) {
        parts.push(
          `<line x1="${ann.from.x + piece.layout.x}" y1="${ann.from.y + piece.layout.y}" x2="${ann.to.x + piece.layout.x}" y2="${ann.to.y + piece.layout.y}" stroke="#017eba" stroke-width="1" marker-end="url(#arrow)"/>`
        );
      }
    }
  }

  return parts.join("\n");
}
