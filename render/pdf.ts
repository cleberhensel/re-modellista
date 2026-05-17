import { jsPDF } from "jspdf";
import { svg2pdf } from "svg2pdf.js";
import { DEFAULT_PX_PER_CM } from "../engine/constants.js";
import type { DraftResult, PatternPiece } from "../engine/types.js";
import type { PatternDocument } from "../editor/types.js";
import { documentToDraftPieces } from "../editor/adapters/from-draft.js";
import { pieceBounds, translatePiece, type PieceBounds } from "./layout.js";
import { seamAllowancePaddingPx } from "./seam-allowance.js";
import {
  a4PageSize,
  A4_HEIGHT_PT,
  A4_WIDTH_PT,
  computeTilePlan,
  mmToPt,
  pickA4Orientation,
  renderInstructionsPageSvg,
  renderPieceCoverSvg,
  renderTilePageSvg,
  type TilePlan,
} from "./pdf-tile.js";
import { pieceLabel, renderPieceSvg, type RenderOptions } from "./svg.js";

const PAGE_MARGIN_PT = DEFAULT_PX_PER_CM;

export interface PrintPageSize {
  width: number;
  height: number;
  marginPt: number;
}

export interface PdfExportOptions extends RenderOptions {
  tileA4?: boolean;
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

async function appendSvgPage(
  doc: jsPDF,
  svg: string,
  pageWidth: number,
  pageHeight: number
): Promise<void> {
  const orientation = pageOrientation(pageWidth, pageHeight);
  doc.addPage([pageWidth, pageHeight], orientation);
  const el = svgElementFromString(svg);
  await svg2pdf(el, doc, {
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
  });
}

async function exportPieceLegacyPage(
  doc: jsPDF,
  piece: PatternPiece,
  bounds: PieceBounds,
  options: RenderOptions
): Promise<void> {
  const page = printPageSize(bounds);
  const placed = translatePiece(
    piece,
    page.marginPt - bounds.minX,
    page.marginPt - bounds.minY
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${page.width}" height="${page.height}" viewBox="0 0 ${page.width} ${page.height}">${renderPieceSvg(placed, true, options)}</svg>`;
  await appendSvgPage(doc, svg, page.width, page.height);
}

async function exportPieceTiledA4(
  doc: jsPDF,
  piece: PatternPiece,
  bounds: PieceBounds,
  options: RenderOptions
): Promise<void> {
  const marginPt = mmToPt(12);
  const title = pieceLabel(piece.id);
  const body = renderPieceSvg(piece, true, options);
  const orientation = pickA4Orientation(bounds, marginPt);
  const { width: pageWidth, height: pageHeight } = a4PageSize(orientation);
  const plan = computeTilePlan({
    bounds,
    marginPt,
    pageWidth,
    pageHeight,
  });

  if (plan.tiles.length > 1) {
    const coverSvg = renderPieceCoverSvg(pageWidth, pageHeight, title, plan);
    await appendSvgPage(doc, coverSvg, pageWidth, pageHeight);
  }

  for (const tile of plan.tiles) {
    const footer = `${title} — ${tile.label} (${tile.index}/${tile.total}) — escala 100%`;
    const tileSvg = renderTilePageSvg(
      body,
      pageWidth,
      pageHeight,
      plan.marginPt,
      plan.printableW,
      plan.printableH,
      tile.originX,
      tile.originY,
      footer,
      plan.overlapPt
    );
    await appendSvgPage(doc, tileSvg, pageWidth, pageHeight);
  }
}

export async function exportDraftToPdf(
  result: DraftResult,
  options: PdfExportOptions = {}
): Promise<Blob> {
  const drawable = result.pieces.filter((p) => p.paths.length > 0);
  if (drawable.length === 0) {
    throw new Error("no_pieces");
  }

  const pxPerCm = options.pxPerCm ?? DEFAULT_PX_PER_CM;
  const instructionsSvg = renderInstructionsPageSvg(
    A4_WIDTH_PT,
    A4_HEIGHT_PT,
    result.productId,
    pxPerCm
  );

  const doc = new jsPDF({
    unit: "pt",
    format: [A4_WIDTH_PT, A4_HEIGHT_PT],
    orientation: "portrait",
    compress: true,
  });

  const el = svgElementFromString(instructionsSvg);
  await svg2pdf(el, doc, {
    x: 0,
    y: 0,
    width: A4_WIDTH_PT,
    height: A4_HEIGHT_PT,
  });

  const useTiling = options.tileA4 !== false;
  let exportedPieces = 0;

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
    if (useTiling) {
      await exportPieceTiledA4(doc, piece, bounds, options);
    } else {
      await exportPieceLegacyPage(doc, piece, bounds, options);
    }
    exportedPieces += 1;
  }

  if (exportedPieces === 0) {
    throw new Error("no_pieces");
  }

  return doc.output("blob");
}

export async function exportDocumentToPdf(
  doc: PatternDocument,
  options: PdfExportOptions = {}
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
  return `${productId}-molde-a4.pdf`;
}

export { fitsSingleA4Sheet, computeTilePlan, type TilePlan } from "./pdf-tile.js";
