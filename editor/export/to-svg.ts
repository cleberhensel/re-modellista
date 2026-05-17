import type { PatternDocument } from "../types.js";
import { documentToDraftPieces } from "../adapters/from-draft.js";
import {
  renderPositionedPiecesToSvg,
  type RenderOptions,
} from "../../render/svg.js";

export function renderDocumentToSvg(
  doc: PatternDocument,
  options: RenderOptions = {}
): string {
  const pieces = documentToDraftPieces(doc);
  return renderPositionedPiecesToSvg(pieces, {
    seamAllowanceCm: options.seamAllowanceCm ?? doc.meta.seamAllowanceCm,
    pxPerCm: options.pxPerCm ?? doc.meta.pxPerCm,
  });
}
