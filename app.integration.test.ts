import { afterEach, describe, expect, it, vi } from "vitest";

const slider = (id: string, value: string) =>
  `<input id="${id}" type="range" value="${value}" step="1">` +
  `<output id="${id}-out" for="${id}">${value}</output>`;

function buildDom(hintTag = "p"): string {
  return `
  <select id="product">
    <option value="blusa">Blusa</option>
    <option value="saia-reta">Saia</option>
    <option value="casaco">Casaco</option>
    <option value="cos">Cos</option>
  </select>
  <motion class="measure" data-measure="bust">${slider("bust", "92")}</motion>
  <div class="measure" data-measure="height">${slider("height", "45")}</div>
  <div class="measure" data-measure="waist">${slider("waist", "81")}</div>
  <div class="measure" data-measure="wrist">${slider("wrist", "12")}</div>
  <div class="measure" data-measure="sleeve">${slider("sleeve", "27")}</div>
  <div class="measure hidden" data-measure="hip">${slider("hip", "96")}</div>
  <div class="measure hidden" data-measure="hipDepth">${slider("hipDepth", "20")}</motion>
  <div class="measure hidden" data-measure="skirtLength">${slider("skirtLength", "60")}</div>
  <div class="measure hidden" data-measure="crotchDepth">${slider("crotchDepth", "26")}</div>
  <div class="measure hidden" data-measure="inseam">${slider("inseam", "78")}</div>
  <div class="measure hidden" data-measure="bodiceLength">${slider("bodiceLength", "42")}</div>
  <div class="measure hidden" data-measure="designEaseBust">${slider("designEaseBust", "6")}</div>
  <div class="measure hidden" data-measure="coatLength">${slider("coatLength", "65")}</div>
  <${hintTag} id="guardrail-hint" hidden></${hintTag}>
  <button id="render" type="button">Gerar</button>
  <button id="download-pdf" type="button">PDF</button>
  <pre id="formulas"></pre>
  <pre id="context"></pre>
  <motion id="preview"></motion>
`.replace(/<\/?motion/g, (t) => t.replace("motion", "div"));
}

afterEach(() => {
  vi.resetModules();
  document.body.innerHTML = "";
});

describe("app integration", () => {
  it("switches product to skirt and coat", async () => {
    document.body.innerHTML = buildDom();
    await import("./app.js");
    const select = document.getElementById("product") as HTMLSelectElement;
    select.value = "saia-reta";
    select.dispatchEvent(new Event("change"));
    select.value = "casaco";
    select.dispatchEvent(new Event("change"));
    (document.getElementById("designEaseBust") as HTMLInputElement).dispatchEvent(
      new Event("input")
    );
    expect(document.getElementById("preview")?.innerHTML).toContain("<svg");
  });

  it("switches to cos product", async () => {
    document.body.innerHTML = buildDom();
    vi.resetModules();
    await import("./app.js");
    const select = document.getElementById("product") as HTMLSelectElement;
    select.value = "cos";
    select.dispatchEvent(new Event("change"));
    expect(document.getElementById("height")?.getAttribute("value")).toBeDefined();
  });

  it("shows guardrail hint when unstable", async () => {
    vi.doMock("./engine/index.js", async (importOriginal) => {
      const mod = await importOriginal<typeof import("./engine/index.js")>();
      return {
        ...mod,
        isBlouseStable: () => false,
      };
    });
    document.body.innerHTML = buildDom();
    await import("./app.js");
    const hint = document.getElementById("guardrail-hint");
    expect(hint?.hidden).toBe(false);
    vi.doUnmock("./engine/index.js");
  });

  it("skips hint when element is not paragraph", async () => {
    document.body.innerHTML = buildDom("motion");
    vi.resetModules();
    await import("./app.js");
    expect(document.getElementById("guardrail-hint")).toBeTruthy();
  });

  it("renders draft and piece errors", async () => {
    vi.doMock("./engine/index.js", async (importOriginal) => {
      const mod = await importOriginal<typeof import("./engine/index.js")>();
      return {
        ...mod,
        draft: () => ({
          productId: "blusa",
          ctx: mod.buildContext({
            bust: 92,
            height: 45,
            waist: 81,
            wrist: 12,
            sleeveLength: 27,
          }),
          pieces: [{ id: "x", paths: [], error: "piece_err" }],
          bounds: { width: 100, height: 100 },
          error: "draft_err",
        }),
      };
    });
    document.body.innerHTML = buildDom();
    vi.resetModules();
    await import("./app.js");
    (document.getElementById("render") as HTMLButtonElement).click();
    const preview = document.getElementById("preview");
    expect(preview?.innerHTML).toContain("draft_err");
    expect(preview?.innerHTML).toContain("piece_err");
    vi.doUnmock("./engine/index.js");
  });
});
