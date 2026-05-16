import { afterEach, describe, expect, it, vi } from "vitest";

const measure = (id: string, value: string, label: string) =>
  `<motion class="measure" data-measure="${id}">` +
  `<div class="measure-head"><span>${label}</span>` +
  `<output id="${id}-out" for="${id}">${value}</output></div>` +
  `<input id="${id}" type="range" value="${value}" step="1"></div>`;

const fullDom = `
  <select id="product"><option value="blusa">Blusa</option></select>
  ${measure("bust", "92", "Busto")}
  ${measure("height", "45", "Comprimento")}
  ${measure("waist", "81", "Cintura")}
  ${measure("wrist", "12", "Punho")}
  ${measure("sleeve", "27", "Manga")}
  ${measure("hip", "96", "Quadril")}
  ${measure("hipDepth", "20", "Altura quadril")}
  ${measure("skirtLength", "60", "Saia")}
  ${measure("crotchDepth", "26", "Gancho")}
  ${measure("inseam", "78", "Entrepernas")}
  ${measure("bodiceLength", "42", "Corpo")}
  ${measure("designEaseBust", "6", "Folga")}
  ${measure("coatLength", "65", "Casaco")}
  <button id="render" type="button">Gerar</button>
  <button id="download-pdf" type="button">PDF</button>
  <p id="guardrail-hint" hidden></p>
  <pre id="formulas"></pre>
  <pre id="context"></pre>
  <div id="preview"></div>
`.replace(/<\/?motion/g, (t) => t.replace("motion", "div"));

const slider = (id: string, value: string) =>
  `<input id="${id}" type="range" value="${value}" step="1">` +
  `<output id="${id}-out" for="${id}">${value}</output>`;

const exportDraftToPdfMock = vi.fn().mockResolvedValue(new Blob(["%PDF"]));

vi.mock("./render/pdf.js", () => ({
  exportDraftToPdf: (...args: unknown[]) => exportDraftToPdfMock(...args),
  pdfFilename: (id: string) => `${id}-molde.pdf`,
}));

afterEach(() => {
  vi.resetModules();
  document.body.innerHTML = "";
  exportDraftToPdfMock.mockClear();
});

describe("app", () => {
  it("renders on load and on button click", async () => {
    document.body.innerHTML = fullDom;
    await import("./app.js");
    const preview = document.getElementById("preview") as HTMLDivElement;
    expect(preview.innerHTML).toContain("<svg");
    expect(document.querySelector('[data-measure="bust"] .measure-head span')?.textContent).toBe(
      "Busto"
    );
    (document.getElementById("bust") as HTMLInputElement).value = "100";
    (document.getElementById("bust") as HTMLInputElement).dispatchEvent(
      new Event("input")
    );
    expect(preview.innerHTML).toContain("<svg");
    expect(document.getElementById("formulas")?.textContent).toContain(
      "bustQuarterCm"
    );
  });

  it("downloads pdf at real scale", async () => {
    document.body.innerHTML = fullDom;
    const clickMock = vi.fn();
    const revokeMock = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:test"),
      revokeObjectURL: revokeMock,
    });
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      const el = document.createElementNS("http://www.w3.org/1999/xhtml", tag);
      if (tag === "a") {
        el.click = clickMock;
      }
      return el as HTMLElement;
    });
    await import("./app.js");
    const downloadBtn = document.getElementById(
      "download-pdf"
    ) as HTMLButtonElement;
    expect(downloadBtn.disabled).toBe(false);
    downloadBtn.click();
    await vi.waitFor(() => expect(exportDraftToPdfMock).toHaveBeenCalled());
    expect(clickMock).toHaveBeenCalled();
    expect(revokeMock).toHaveBeenCalledWith("blob:test");
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("alerts when pdf export fails", async () => {
    document.body.innerHTML = fullDom;
    exportDraftToPdfMock.mockRejectedValueOnce(new Error("pdf_fail"));
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    await import("./app.js");
    const downloadBtn = document.getElementById(
      "download-pdf"
    ) as HTMLButtonElement;
    downloadBtn.click();
    await vi.waitFor(() => expect(alertMock).toHaveBeenCalled());
    alertMock.mockRestore();
  });

  it("exposes product id in context panel", async () => {
    document.body.innerHTML = fullDom;
    await import("./app.js");
    expect(document.getElementById("context")?.textContent).toContain(
      '"productId": "blusa"'
    );
  });

  it("throws when product select is missing", async () => {
    document.body.innerHTML = fullDom.replace(
      '<select id="product"><option value="blusa">Blusa</option></select>\n  ',
      ""
    );
    await expect(import("./app.js")).rejects.toThrow("missing #product");
  });

  it("throws when output element is missing", async () => {
    document.body.innerHTML = fullDom.replace(
      '<output id="bust-out" for="bust">92</output>',
      ""
    );
    await expect(import("./app.js")).rejects.toThrow("missing output #bust-out");
  });

  it("throws when required inputs are missing", async () => {
    document.body.innerHTML = fullDom.replace(
      '<input id="bust" type="range" value="92" step="1">',
      ""
    );
    await expect(import("./app.js")).rejects.toThrow("missing slider #bust");
  });

  it("throws when download button is missing", async () => {
    document.body.innerHTML = fullDom.replace(
      '<button id="download-pdf" type="button">PDF</button>\n  ',
      ""
    );
    await expect(import("./app.js")).rejects.toThrow("missing #download-pdf");
  });

  it("throws when render button is missing", async () => {
    document.body.innerHTML = fullDom.replace(
      '<button id="render" type="button">Gerar</button>\n  ',
      ""
    );
    await expect(import("./app.js")).rejects.toThrow("missing #render");
  });

  it("throws when formulas panel is missing", async () => {
    document.body.innerHTML = fullDom.replace(
      '<pre id="formulas"></pre>\n  ',
      ""
    );
    await expect(import("./app.js")).rejects.toThrow("missing #formulas");
  });

  it("throws when context panel is missing", async () => {
    document.body.innerHTML = fullDom.replace(
      '<pre id="context"></pre>\n  ',
      ""
    );
    await expect(import("./app.js")).rejects.toThrow("missing #context");
  });

  it("throws when preview panel is missing", async () => {
    document.body.innerHTML = fullDom.replace('<div id="preview"></div>\n', "");
    await expect(import("./app.js")).rejects.toThrow("missing #preview");
  });
});
