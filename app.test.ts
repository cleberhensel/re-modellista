import { afterEach, describe, expect, it, vi } from "vitest";

const slider = (id: string, value: string) =>
  `<input id="${id}" type="range" value="${value}" step="1">` +
  `<output id="${id}-out" for="${id}">${value}</output>`;

const fullDom = `
  ${slider("bust", "92")}
  ${slider("height", "45")}
  ${slider("waist", "81")}
  ${slider("wrist", "12")}
  ${slider("sleeve", "27")}
  <button id="render" type="button">Gerar</button>
  <p id="guardrail-hint" hidden></p>
  <pre id="formulas"></pre>
  <pre id="context"></pre>
  <div id="preview"></div>
`;

afterEach(() => {
  vi.resetModules();
  document.body.innerHTML = "";
});

describe("app", () => {
  it("renders on load and on button click", async () => {
    document.body.innerHTML = fullDom;
    await import("./app.js");
    const preview = document.getElementById("preview") as HTMLDivElement;
    expect(preview.innerHTML).toContain("<svg");
    (document.getElementById("bust") as HTMLInputElement).value = "100";
    (document.getElementById("bust") as HTMLInputElement).dispatchEvent(
      new Event("input")
    );
    expect(preview.innerHTML).toContain("<svg");
    expect(document.getElementById("formulas")?.textContent).toContain(
      "bustQuarterCm"
    );
  });

  it("exposes engine seventh scale in context panel", async () => {
    document.body.innerHTML = fullDom;
    await import("./app.js");
    expect(document.getElementById("context")?.textContent).toContain(
      '"one": 6'
    );
  });

  it("throws when required inputs are missing", async () => {
    document.body.innerHTML = fullDom.replace(
      slider("bust", "92"),
      ""
    );
    await expect(import("./app.js")).rejects.toThrow("missing slider #bust");
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
    document.body.innerHTML = fullDom.replace(
      '<div id="preview"></div>\n',
      ""
    );
    await expect(import("./app.js")).rejects.toThrow("missing #preview");
  });
});
