import { describe, expect, it, vi } from "vitest";
import { draft } from "../engine/index.js";
import { DEFAULT_PX_PER_CM } from "../engine/constants.js";
import { lineSegment, point } from "../engine/geometry.js";
import * as pdfTileModule from "./pdf-tile.js";
import * as svgModule from "./svg.js";
import {
  exportDraftToPdf,
  pdfFilename,
  printPageSize,
} from "./pdf.js";

const outputMock = vi.fn(() => new Blob(["%PDF"], { type: "application/pdf" }));
const addPageMock = vi.fn();
const svg2pdfMock = vi.fn().mockResolvedValue(undefined);

vi.mock("jspdf", () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    addPage: addPageMock,
    output: outputMock,
  })),
}));

vi.mock("svg2pdf.js", () => ({
  svg2pdf: (...args: unknown[]) => svg2pdfMock(...args),
}));

describe("printPageSize", () => {
  it("adds 1 cm margin on each side in pt", () => {
    const page = printPageSize({
      minX: 50,
      minY: 40,
      maxX: 150,
      maxY: 240,
      width: 100,
      height: 200,
    });
    expect(page.marginPt).toBe(DEFAULT_PX_PER_CM);
    expect(page.width).toBe(100 + DEFAULT_PX_PER_CM * 2);
    expect(page.height).toBe(200 + DEFAULT_PX_PER_CM * 2);
  });
});

describe("exportDraftToPdf", () => {
  it("builds tiled A4 pdf with instructions and piece pages", async () => {
    const result = draft(
      { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
      { productId: "blusa" }
    );
    const blob = await exportDraftToPdf(result);
    expect(blob.type).toBe("application/pdf");
    expect(svg2pdfMock).toHaveBeenCalled();
    expect(outputMock).toHaveBeenCalledWith("blob");
    expect(addPageMock.mock.calls.length).toBeGreaterThan(result.pieces.length);
  });

  it("throws when there are no drawable pieces", async () => {
    await expect(
      exportDraftToPdf({
        productId: "blusa",
        ctx: draft(
          { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
          { productId: "blusa" }
        ).ctx,
        pieces: [],
        bounds: { width: 100, height: 100 },
      })
    ).rejects.toThrow("no_pieces");
  });

  it("names download file from product id", () => {
    expect(pdfFilename("camisa")).toBe("camisa-molde-a4.pdf");
  });

  it("throws when every piece has zero bounds", async () => {
    const base = draft(
      { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
      { productId: "blusa" }
    );
    await expect(
      exportDraftToPdf({
        ...base,
        pieces: [{ id: "dot", paths: [{ type: "move", to: { x: 0, y: 0 } }] }],
      })
    ).rejects.toThrow("no_pieces");
  });

  it("adds landscape tile pages for wide pieces", async () => {
    const base = draft(
      { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
      { productId: "blusa" }
    );
    await exportDraftToPdf({
      ...base,
      pieces: [
        {
          id: "wide",
          paths: [
            lineSegment(point(0, 0), point(650, 0)),
            lineSegment(point(650, 0), point(650, 80)),
            lineSegment(point(650, 80), point(0, 80)),
            lineSegment(point(0, 80), point(0, 0)),
          ],
        },
      ],
    });
    const landscapePages = addPageMock.mock.calls.filter(
      (call) => call[1] === "landscape"
    );
    expect(landscapePages.length).toBeGreaterThan(0);
  });

  it("skips seam padding when allowance is zero", async () => {
    const result = draft(
      { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
      { productId: "blusa" }
    );
    const blob = await exportDraftToPdf(result, { seamAllowanceCm: 0 });
    expect(blob.type).toBe("application/pdf");
  });

  it("throws on invalid svg markup", async () => {
    const base = draft(
      { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
      { productId: "blusa" }
    );
    vi.spyOn(pdfTileModule, "renderTilePageSvg").mockReturnValue(
      "<html></html>"
    );
    await expect(exportDraftToPdf(base)).rejects.toThrow("invalid_svg");
    vi.restoreAllMocks();
  });
});
