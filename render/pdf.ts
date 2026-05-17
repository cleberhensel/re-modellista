import { jsPDF } from "jspdf";
import { svg2pdf } from "svg2pdf.js";
import { DEFAULT_PX_PER_CM } from "../engine/constants.js";
import type { DraftResult } from "../engine/types.js";
import type { PatternDocument } from "../editor/types.js";
import { documentToDraftPieces } from "../editor/adapters/from-draft.js";
import { pieceBounds, translatePiece, type PieceBounds } from "./layout.js";
import { seamAllowancePaddingPx } from "./seam-allowance.js";
import { renderPieceToPrintSvg, type RenderOptions } from "./svg.js";

const PAGE_MARGIN_PT = DEFAULT_PX_PER_CM;

export interface PrintPageSize {
  width: number;
  height: number;
  marginPt: number;
}

export function printPageSize(
  bounds: PieceBounds,
  marginPt = PAGE_MARGIN_PT
): PrintPageSize {
  return {
    width: bounds.width + marginPt * 2,
    height: bounds.height + marginPt * 2,
    marginPt,
  };
}

function svgElementFromString(svg: string): SVGSVGElement {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  const el = doc.documentElement;
  if (!(el instanceof SVGSVGElement)) {
    throw new Error("invalid_svg");
  }
  return el;
}

function pageOrientation(width: number, height: number): "portrait" | "landscape" {
  return width > height ? "landscape" : "portrait";
}

function expandBoundsForSeamAllowance(
  bounds: ReturnType<typeof pieceBounds>,
  paddingPx: number
) {
  if (paddingPx <= 0) return bounds;
  return {
    minX: bounds.minX - paddingPx,
    minY: bounds.minY - paddingPx,
    maxX: bounds.maxX + paddingPx,
    maxY: bounds.maxY + paddingPx,
    width: bounds.width + paddingPx * 2,
    height: bounds.height + paddingPx * 2,
  };
}

export async function exportDraftToPdf(
  result: DraftResult,
  options: RenderOptions = {}
): Promise<Blob> {
  const drawable = result.pieces.filter((p) => p.paths.length > 0);
  if (drawable.length === 0) {
    throw new Error("no_pieces");
  }

  let doc: jsPDF | null = null;

  for (const piece of drawable) {
    const rawBounds = pieceBounds(piece);
    if (rawBounds.width <= 0 && rawBounds.height <= 0) {
      continue;
    }
    const paddingPx = seamAllowancePaddingPx(
      options.seamAllowanceCm,
      options.pxPerCm
    );
    const bounds = expandBoundsForSeamAllowance(rawBounds, paddingPx);
    const page = printPageSize(bounds);
    const orientation = pageOrientation(page.width, page.height);
    if (!doc) {
      doc = new jsPDF({
        unit: "pt",
        format: [page.width, page.height],
        orientation,
        compress: true,
      });
    } else {
      doc.addPage([page.width, page.height], orientation);
    }
    const placed = translatePiece(
      piece,
      page.marginPt - bounds.minX,
      page.marginPt - bounds.minY
    );
    const svg = renderPieceToPrintSvg(
      placed,
      page.width,
      page.height,
      options
    );
    const el = svgElementFromString(svg);
    await svg2pdf(el, doc, {
      x: 0,
      y: 0,
      width: page.width,
      height: page.height,
    });
  }

  if (!doc) {
    throw new Error("no_pieces");
  }

  return doc.output("blob");
}

export async function exportDocumentToPdf(
  doc: PatternDocument,
  options: RenderOptions = {}
): Promise<Blob> {
  const pieces = documentToDraftPieces(doc);
  const fakeDraft: DraftResult = {
    productId: doc.meta.productId,
    ctx: { measurements: { bust: 90, height: 60, waist: 70, wrist: 16, sleeveLength: 58 }, draftOptions: {}, k: 1, margin: 0, start: 0, startOne: 0, startTwo: 0, widthPx: 0, heightPx: 0, hipPx: 0, seventh: { one: 0, two: 0, three: 0, four: 0, five: 0, six: 0, seven: 0 }, s: { one: 0, two: 0, three: 0, four: 0, five: 0, six: 0, seven: 0 }, formulas: { bustQuarterCm: 0, bustHalfCm: 0, seventhOneCm: 0, seventhTwoCm: 0, seventhFourCm: 0, widthPx: 0, heightPx: 0, hipPx: 0, shoulderY: 0, armholeLineY: 0 } },
    pieces,
    bounds: { width: 400, height: 400 },
  };
  return exportDraftToPdf(fakeDraft, {
    ...options,
    seamAllowanceCm: options.seamAllowanceCm ?? doc.meta.seamAllowanceCm,
    pxPerCm: options.pxPerCm ?? doc.meta.pxPerCm,
  });
}

export function pdfFilename(productId: string): string {
  return `${productId}-molde.pdf`;
}
