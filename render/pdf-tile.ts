import { DEFAULT_PX_PER_CM } from "../engine/constants.js";
import type { PieceBounds } from "./layout.js";

export const MM_TO_PT = 72 / 25.4;
export const A4_WIDTH_PT = 210 * MM_TO_PT;
export const A4_HEIGHT_PT = 297 * MM_TO_PT;
export const PRINT_MARGIN_MM = 12;
export const TILE_OVERLAP_MM = 10;
export const TEST_SQUARE_CM = 5;

export function mmToPt(mm: number): number {
  return mm * MM_TO_PT;
}

export function cmToPt(cm: number, pxPerCm = DEFAULT_PX_PER_CM): number {
  return cm * pxPerCm;
}

export interface TileSpec {
  col: number;
  row: number;
  originX: number;
  originY: number;
  label: string;
  index: number;
  total: number;
}

export interface TilePlan {
  cols: number;
  rows: number;
  printableW: number;
  printableH: number;
  stepX: number;
  stepY: number;
  marginPt: number;
  overlapPt: number;
  pageWidth: number;
  pageHeight: number;
  tiles: TileSpec[];
}

export interface TilePlanInput {
  bounds: PieceBounds;
  marginPt?: number;
  overlapPt?: number;
  pageWidth?: number;
  pageHeight?: number;
}

export function printableArea(
  pageWidth = A4_WIDTH_PT,
  pageHeight = A4_HEIGHT_PT,
  marginPt = mmToPt(PRINT_MARGIN_MM)
): { width: number; height: number; marginPt: number } {
  return {
    width: pageWidth - marginPt * 2,
    height: pageHeight - marginPt * 2,
    marginPt,
  };
}

export function fitsSingleA4Sheet(
  bounds: PieceBounds,
  marginPt = mmToPt(PRINT_MARGIN_MM),
  pageWidth = A4_WIDTH_PT,
  pageHeight = A4_HEIGHT_PT
): boolean {
  const { width, height } = printableArea(pageWidth, pageHeight, marginPt);
  return bounds.width <= width && bounds.height <= height;
}

export function tileColumnLabel(col: number): string {
  return String(col + 1);
}

export function tileRowLabel(row: number): string {
  return String.fromCharCode(65 + row);
}

export function tileLabel(col: number, row: number): string {
  return `${tileRowLabel(row)}${tileColumnLabel(col)}`;
}

export function computeTilePlan(input: TilePlanInput): TilePlan {
  const pageWidth = input.pageWidth ?? A4_WIDTH_PT;
  const pageHeight = input.pageHeight ?? A4_HEIGHT_PT;
  const marginPt = input.marginPt ?? mmToPt(PRINT_MARGIN_MM);
  const overlapPt = input.overlapPt ?? mmToPt(TILE_OVERLAP_MM);
  const { width: printableW, height: printableH } = printableArea(
    pageWidth,
    pageHeight,
    marginPt
  );
  const stepX = Math.max(printableW - overlapPt, 1);
  const stepY = Math.max(printableH - overlapPt, 1);
  const cols = Math.max(1, Math.ceil(input.bounds.width / stepX));
  const rows = Math.max(1, Math.ceil(input.bounds.height / stepY));
  const tiles: TileSpec[] = [];
  let index = 0;
  const total = cols * rows;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const originX =
        cols === 1
          ? input.bounds.minX
          : Math.min(
              input.bounds.minX + col * stepX,
              input.bounds.minX + input.bounds.width - printableW
            );
      const originY =
        rows === 1
          ? input.bounds.minY
          : Math.min(
              input.bounds.minY + row * stepY,
              input.bounds.minY + input.bounds.height - printableH
            );
      index += 1;
      tiles.push({
        col,
        row,
        originX,
        originY,
        label: tileLabel(col, row),
        index,
        total,
      });
    }
  }
  return {
    cols,
    rows,
    printableW,
    printableH,
    stepX,
    stepY,
    marginPt,
    overlapPt,
    pageWidth,
    pageHeight,
    tiles,
  };
}

export function pickA4Orientation(
  bounds: PieceBounds,
  marginPt = mmToPt(PRINT_MARGIN_MM)
): "portrait" | "landscape" {
  const portrait = printableArea(A4_WIDTH_PT, A4_HEIGHT_PT, marginPt);
  const landscape = printableArea(A4_HEIGHT_PT, A4_WIDTH_PT, marginPt);
  const fitsPortrait =
    bounds.width <= portrait.width && bounds.height <= portrait.height;
  const fitsLandscape =
    bounds.width <= landscape.width && bounds.height <= landscape.height;
  if (fitsPortrait && !fitsLandscape) return "portrait";
  if (fitsLandscape && !fitsPortrait) return "landscape";
  const portraitSlack = portrait.width - bounds.width + (portrait.height - bounds.height);
  const landscapeSlack = landscape.width - bounds.width + (landscape.height - bounds.height);
  return landscapeSlack > portraitSlack ? "landscape" : "portrait";
}

export function a4PageSize(orientation: "portrait" | "landscape"): {
  width: number;
  height: number;
} {
  if (orientation === "landscape") {
    return { width: A4_HEIGHT_PT, height: A4_WIDTH_PT };
  }
  return { width: A4_WIDTH_PT, height: A4_HEIGHT_PT };
}

function registrationMarksSvg(
  margin: number,
  printableW: number,
  printableH: number,
  overlap: number
): string {
  const marks: string[] = [];
  const cross = (cx: number, cy: number) =>
    `<g stroke="#000" stroke-width="0.6" fill="none">` +
    `<line x1="${(cx - 4).toFixed(2)}" y1="${cy.toFixed(2)}" x2="${(cx + 4).toFixed(2)}" y2="${cy.toFixed(2)}"/>` +
    `<line x1="${cx.toFixed(2)}" y1="${(cy - 4).toFixed(2)}" x2="${cx.toFixed(2)}" y2="${(cy + 4).toFixed(2)}"/>` +
    `</g>`;
  const corners: [number, number][] = [
    [margin, margin],
    [margin + printableW, margin],
    [margin, margin + printableH],
    [margin + printableW, margin + printableH],
  ];
  for (const [x, y] of corners) {
    marks.push(cross(x, y));
  }
  if (overlap > 0) {
    marks.push(cross(margin + printableW - overlap, margin + printableH / 2));
    marks.push(cross(margin + printableW / 2, margin + printableH - overlap));
  }
  return marks.join("\n");
}

export function renderTestSquareSvg(
  pageWidth: number,
  pageHeight: number,
  pxPerCm = DEFAULT_PX_PER_CM
): string {
  const side = cmToPt(TEST_SQUARE_CM, pxPerCm);
  const x = pageWidth - side - mmToPt(20);
  const y = mmToPt(24);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}">` +
    `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${side.toFixed(2)}" height="${side.toFixed(2)}" fill="none" stroke="#000" stroke-width="1"/>` +
    `<text x="${x.toFixed(2)}" y="${(y - 6).toFixed(2)}" font-size="9" font-family="system-ui,sans-serif" fill="#000">${TEST_SQUARE_CM} cm — medir antes de imprimir tudo</text>` +
    `</svg>`
  );
}

function productDisplayName(productId: string): string {
  const names: Record<string, string> = {
    blusa: "Blusa",
    "saia-reta": "Saia reta",
    casaco: "Casaco",
    cos: "Cós",
  };
  return names[productId] ?? productId;
}

export function renderInstructionsPageSvg(
  pageWidth: number,
  pageHeight: number,
  productId: string,
  pxPerCm = DEFAULT_PX_PER_CM
): string {
  const side = cmToPt(TEST_SQUARE_CM, pxPerCm);
  const marginX = mmToPt(20);
  const lineH = mmToPt(5.5);
  let y = mmToPt(24);

  const parts: string[] = [];
  const textLine = (content: string, size: number, bold = false) => {
    const weight = bold ? ' font-weight="600"' : "";
    parts.push(
      `<text x="${marginX.toFixed(2)}" y="${y.toFixed(2)}" font-size="${size}"${weight} font-family="system-ui,sans-serif" fill="#111">${escapeXml(content)}</text>`
    );
    y += lineH;
  };

  textLine("Remodellista — impressão A4 em tamanho real", 13, true);
  textLine(`Produto: ${productDisplayName(productId)}`, 10);
  y += mmToPt(3);
  textLine("1. Imprimir em escala 100% (tamanho real). Não usar «ajustar à página».", 10);
  textLine("2. Medir o quadrado de calibração abaixo — deve medir exatamente 5 cm.", 10);
  textLine("3. Recortar ou sobrepor folhas pelas marcas de registo e linhas do molde.", 10);
  textLine("4. Colar com fita nas áreas de sobreposição (~1 cm entre folhas).", 10);

  const sqY = y + mmToPt(8);
  const sqX = (pageWidth - side) / 2;
  const labelY = sqY - mmToPt(4);
  const dimLabel = `${TEST_SQUARE_CM} cm`;

  parts.push(
    `<text x="${(pageWidth / 2).toFixed(2)}" y="${labelY.toFixed(2)}" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif" fill="#111">Quadrado de calibração</text>`,
    `<rect x="${sqX.toFixed(2)}" y="${sqY.toFixed(2)}" width="${side.toFixed(2)}" height="${side.toFixed(2)}" fill="#fafafa" stroke="#000" stroke-width="1.2"/>`,
    `<text x="${(sqX + side / 2).toFixed(2)}" y="${(sqY + side + mmToPt(5)).toFixed(2)}" text-anchor="middle" font-size="9" font-family="system-ui,sans-serif" fill="#111">${dimLabel}</text>`,
    `<text x="${(sqX - mmToPt(5)).toFixed(2)}" y="${(sqY + side / 2 + 3).toFixed(2)}" text-anchor="end" font-size="9" font-family="system-ui,sans-serif" fill="#111" transform="rotate(-90 ${(sqX - mmToPt(5)).toFixed(2)} ${(sqY + side / 2).toFixed(2)})">${dimLabel}</text>`,
    `<text x="${marginX.toFixed(2)}" y="${(pageHeight - mmToPt(12)).toFixed(2)}" font-size="8" font-family="system-ui,sans-serif" fill="#666">Página 1 · Calibração · escala 100%</text>`
  );

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}">` +
    `<rect width="100%" height="100%" fill="#fff"/>` +
    parts.join("") +
    `</svg>`
  );
}

export function renderPieceCoverSvg(
  pageWidth: number,
  pageHeight: number,
  pieceTitle: string,
  plan: TilePlan
): string {
  const cell = Math.min(
    mmToPt(18),
    (pageWidth - mmToPt(40)) / plan.cols,
    (pageHeight - mmToPt(80)) / plan.rows
  );
  const gridW = plan.cols * cell;
  const gridH = plan.rows * cell;
  const gx = (pageWidth - gridW) / 2;
  const gy = mmToPt(48);
  const cells: string[] = [];
  for (let row = 0; row < plan.rows; row++) {
    for (let col = 0; col < plan.cols; col++) {
      const x = gx + col * cell;
      const y = gy + row * cell;
      cells.push(
        `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" fill="#f4f4f5" stroke="#000" stroke-width="0.8"/>` +
          `<text x="${(x + cell / 2).toFixed(2)}" y="${(y + cell / 2 + 4).toFixed(2)}" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif" fill="#000">${tileLabel(col, row)}</text>`
      );
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}">` +
    `<text x="${mmToPt(18).toFixed(2)}" y="${mmToPt(24).toFixed(2)}" font-size="14" font-weight="bold" font-family="system-ui,sans-serif" fill="#000">${escapeXml(pieceTitle)}</text>` +
    `<text x="${mmToPt(18).toFixed(2)}" y="${mmToPt(38).toFixed(2)}" font-size="10" font-family="system-ui,sans-serif" fill="#000">${plan.cols}×${plan.rows} folhas (${plan.tiles.length} páginas) — ordem por linhas A, B, C…</text>` +
    cells.join("") +
    `</svg>`
  );
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderTilePageSvg(
  pieceBody: string,
  pageWidth: number,
  pageHeight: number,
  marginPt: number,
  printableW: number,
  printableH: number,
  tileOriginX: number,
  tileOriginY: number,
  footer: string,
  overlapPt: number
): string {
  const tx = marginPt - tileOriginX;
  const ty = marginPt - tileOriginY;
  const clipId = `clip-${tileOriginX.toFixed(0)}-${tileOriginY.toFixed(0)}`;
  const marks = registrationMarksSvg(marginPt, printableW, printableH, overlapPt);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}">` +
    `<defs><clipPath id="${clipId}"><rect x="${marginPt}" y="${marginPt}" width="${printableW}" height="${printableH}"/></clipPath></defs>` +
    `<rect x="0" y="0" width="${pageWidth}" height="${pageHeight}" fill="#fff"/>` +
    `<g clip-path="url(#${clipId})"><g transform="translate(${tx.toFixed(2)}, ${ty.toFixed(2)})">${pieceBody}</g></g>` +
    marks +
    `<text x="${marginPt.toFixed(2)}" y="${(pageHeight - marginPt / 2).toFixed(2)}" font-size="9" font-family="system-ui,sans-serif" fill="#000">${escapeXml(footer)}</text>` +
    `</svg>`
  );
}
