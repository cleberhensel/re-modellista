import { jsPDF } from "jspdf";
import { svg2pdf } from "svg2pdf.js";
import { DEFAULT_PX_PER_CM } from "../engine/constants.js";
import type { DraftResult } from "../engine/types.js";
import { pieceBounds, translatePiece, type PieceBounds } from "./layout.js";
import { renderPieceToPrintSvg } from "./svg.js";

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

export async function exportDraftToPdf(result: DraftResult): Promise<Blob> {
  const drawable = result.pieces.filter((p) => p.paths.length > 0);
  if (drawable.length === 0) {
    throw new Error("no_pieces");
  }

  let doc: jsPDF | null = null;

  for (const piece of drawable) {
    const bounds = pieceBounds(piece);
    if (bounds.width <= 0 && bounds.height <= 0) {
      continue;
    }
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
    const svg = renderPieceToPrintSvg(placed, page.width, page.height);
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

export function pdfFilename(productId: string): string {
  return `${productId}-molde.pdf`;
}
