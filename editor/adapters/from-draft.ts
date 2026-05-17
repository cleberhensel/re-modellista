import type { DraftResult, PatternPiece } from "../../engine/types.js";
import { layoutPieces, pieceBounds, translatePiece } from "../../render/layout.js";
import type { PatternDocument } from "../types.js";
import { resetIdCounter } from "../document.js";
import { piecePathsToPatternPiece } from "./path-to-segments.js";
import {
  dashedSegmentsToPath,
  segmentsToEditablePath,
} from "./segments-to-path.js";

const PIECE_LABELS: Record<string, string> = {
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

export interface FromDraftOptions {
  seamAllowanceCm: number;
  productId: string;
  pxPerCm?: number;
}

function pieceToEditablePaths(piece: PatternPiece) {
  const paths = [];
  const cut = segmentsToEditablePath(piece.paths, "cut-0", "cut");
  if (cut) paths.push(cut);
  const guide = dashedSegmentsToPath(piece.paths, "guide-0");
  if (guide) paths.push(guide);
  return paths;
}

export function fromDraft(
  draft: DraftResult,
  options: FromDraftOptions
): PatternDocument {
  resetIdCounter();
  const drawable = draft.pieces.filter((p) => p.paths.length > 0);
  const layoutOpts = {
    productId: options.productId,
    seamAllowanceCm: options.seamAllowanceCm,
    pxPerCm: options.pxPerCm,
  };
  const { pieces: laidOut } = layoutPieces(drawable, layoutOpts);

  const pieces = drawable.map((original) => {
    const laid = laidOut.find((p) => p.id === original.id) ?? original;
    const ob = pieceBounds(original);
    const lb = pieceBounds(laid);
    return {
      id: original.id,
      label: PIECE_LABELS[original.id] ?? original.id,
      paths: pieceToEditablePaths(original),
      layout: {
        x: lb.minX - ob.minX,
        y: lb.minY - ob.minY,
      },
      layoutManual: false,
      annotations: [],
    };
  });

  return {
    version: 1,
    unit: "cm",
    pieces,
    meta: {
      productId: options.productId,
      generatedAt: new Date().toISOString(),
      seamAllowanceCm: options.seamAllowanceCm,
      pxPerCm: options.pxPerCm,
      editState: "draft",
    },
    manualEditRevision: 0,
  };
}

export function documentToDraftPieces(doc: PatternDocument): PatternPiece[] {
  return doc.pieces.map((piece) => {
    const local = piecePathsToPatternPiece(piece.id, piece.paths);
    return translatePiece(
      { id: piece.id, paths: local.paths },
      piece.layout.x,
      piece.layout.y
    );
  });
}
