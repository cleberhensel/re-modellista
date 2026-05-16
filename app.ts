import { draft, getGuardrails, isBlouseStable } from "./engine/index.js";
import type { DraftOptions, Measurements } from "./engine/types.js";
import type { MeasurementKey } from "./engine/guardrails/types.js";
import {
  getProduct,
  listCatalogGroups,
  type ProductId,
} from "./catalog/products.js";
import { renderDraftToSvg } from "./render/svg.js";

const SLIDER_DOM: Record<string, string> = {
  bust: "bust",
  height: "height",
  waist: "waist",
  wrist: "wrist",
  sleeveLength: "sleeve",
  hip: "hip",
  hipDepth: "hipDepth",
  skirtLength: "skirtLength",
  crotchDepth: "crotchDepth",
  inseam: "inseam",
  bodiceLength: "bodiceLength",
  designEaseBust: "designEaseBust",
  coatLength: "coatLength",
};

const SLIDER_LABELS: Record<string, string> = {
  bust: "Busto",
  height: "Comprimento",
  waist: "Cintura",
  wrist: "Punho",
  sleeveLength: "Manga",
  hip: "Quadril",
  hipDepth: "Altura quadril",
  skirtLength: "Comprimento saia",
  crotchDepth: "Gancho",
  inseam: "Entrepernas",
  bodiceLength: "Corpo",
  designEaseBust: "Folga busto",
  coatLength: "Comprimento",
};

let currentProductId: ProductId = "blusa";

function productSelect(): HTMLSelectElement {
  const el = document.getElementById("product");
  if (!(el instanceof HTMLSelectElement)) {
    throw new Error("missing #product");
  }
  return el;
}

function sliderEl(domId: string): HTMLInputElement {
  const el = document.getElementById(domId);
  if (!(el instanceof HTMLInputElement)) {
    throw new Error(`missing slider #${domId}`);
  }
  return el;
}

function outputEl(domId: string): HTMLOutputElement {
  const el = document.getElementById(`${domId}-out`);
  if (!(el instanceof HTMLOutputElement)) {
    throw new Error(`missing output #${domId}-out`);
  }
  return el;
}

function readMeasurements(): Measurements {
  const product = getProduct(currentProductId)!;
  const values: Record<string, number> = {};
  for (const key of product.measureKeys) {
    const domId = SLIDER_DOM[key] ?? key;
    values[key] = Number(sliderEl(domId).value);
  }
  return values as Measurements;
}

function draftOptions(): DraftOptions {
  return { productId: currentProductId };
}

function syncProductSelect(): void {
  const select = productSelect();
  select.innerHTML = "";
  for (const group of listCatalogGroups()) {
    const optgroup = document.createElement("optgroup");
    optgroup.label = group.label;
    for (const p of group.products) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.label;
      opt.disabled = !p.implemented;
      optgroup.appendChild(opt);
    }
    select.appendChild(optgroup);
  }
  select.value = currentProductId;
}

function syncMeasureVisibility(): void {
  const product = getProduct(currentProductId)!;
  const visible = new Set(
    product.measureKeys.map((k) => SLIDER_DOM[k] ?? k)
  );
  for (const el of document.querySelectorAll<HTMLElement>("[data-measure]")) {
    const key = el.dataset.measure;
    if (!key) continue;
    el.classList.toggle("hidden", !visible.has(key));
  }
}

function syncSliders(
  measurements: Measurements,
  options: DraftOptions
): void {
  const guardrails = getGuardrails(currentProductId);
  const product = getProduct(currentProductId)!;
  for (const key of product.measureKeys) {
    const domId = SLIDER_DOM[key] ?? key;
    const range = guardrails.getFieldRange(measurements, key, options);
    const slider = sliderEl(domId);
    slider.min = String(range.min);
    slider.max = String(range.max);
    slider.step = String(range.step);
    const value = (measurements as Record<string, number>)[key];
    slider.value = String(value);
    outputEl(domId).textContent = String(value);
  }
}

function updateGuardrailHint(
  measurements: Measurements,
  options: DraftOptions
): void {
  const hint = document.getElementById("guardrail-hint");
  if (!(hint instanceof HTMLParagraphElement)) {
    return;
  }
  const stable =
    currentProductId === "blusa" ||
    currentProductId === "malha" ||
    currentProductId === "top-sem-mangas" ||
    currentProductId === "camisa" ||
    currentProductId === "manga"
      ? isBlouseStable(measurements, options)
      : true;
  if (stable) {
    hint.hidden = true;
    hint.textContent = "";
    return;
  }
  hint.hidden = false;
  hint.textContent =
    "Combinação ajustada automaticamente para manter ombro e pences válidos.";
}

function applyMeasurements(
  measurements: Measurements,
  changed: MeasurementKey,
  options: DraftOptions
): Measurements {
  const resolved = getGuardrails(currentProductId).resolve(
    measurements,
    changed,
    options
  );
  syncSliders(resolved, options);
  updateGuardrailHint(resolved, options);
  return resolved;
}

function applyProduct(id: ProductId): void {
  currentProductId = id;
  const product = getProduct(id)!;
  for (const key of product.measureKeys) {
    const domId = SLIDER_DOM[key] ?? key;
    const def = product.defaults[key];
    if (def !== undefined) {
      sliderEl(domId).value = String(def);
    }
  }
  syncMeasureVisibility();
  applyMeasurements(readMeasurements(), product.measureKeys[0], draftOptions());
}

function render(): void {
  const options = draftOptions();
  const measurements = readMeasurements();
  const result = draft(measurements, options);
  const formulasEl = document.getElementById("formulas");
  const contextEl = document.getElementById("context");
  const previewEl = document.getElementById("preview");
  if (!(formulasEl instanceof HTMLPreElement)) {
    throw new Error("missing #formulas");
  }
  if (!(contextEl instanceof HTMLPreElement)) {
    throw new Error("missing #context");
  }
  if (!(previewEl instanceof HTMLDivElement)) {
    throw new Error("missing #preview");
  }
  const ctx = result.ctx;
  const formulas =
    "formulas" in ctx ? ctx.formulas : { product: result.productId };
  formulasEl.textContent = JSON.stringify(formulas, null, 2);
  contextEl.textContent = JSON.stringify(
    {
      productId: result.productId,
      meta: result.meta,
      k: "k" in ctx ? ctx.k : undefined,
    },
    null,
    2
  );
  previewEl.innerHTML = renderDraftToSvg(result);
  if (result.error) {
    previewEl.insertAdjacentHTML(
      "beforeend",
      `<p class="draft-error">${result.error}</p>`
    );
  }
  for (const piece of result.pieces) {
    if (piece.error) {
      previewEl.insertAdjacentHTML(
        "beforeend",
        `<p class="draft-error">${piece.id}: ${piece.error}</p>`
      );
    }
  }
}

function onSliderInput(domId: string): void {
  const product = getProduct(currentProductId)!;
  const key = product.measureKeys.find((k) => (SLIDER_DOM[k] ?? k) === domId);
  if (!key) return;
  applyMeasurements(readMeasurements(), key, draftOptions());
  render();
}

function initSliders(): void {
  for (const [key, domId] of Object.entries(SLIDER_DOM)) {
    const wrap = document.querySelector(`[data-measure="${domId}"]`);
    if (!wrap) continue;
    const label = wrap.querySelector(".measure-head span");
    if (label && SLIDER_LABELS[key]) {
      label.textContent = SLIDER_LABELS[key];
    }
    sliderEl(domId).addEventListener("input", () => onSliderInput(domId));
  }
}

syncProductSelect();
initSliders();
productSelect().addEventListener("change", () => {
  applyProduct(productSelect().value as ProductId);
  render();
});

const renderBtn = document.getElementById("render");
if (!(renderBtn instanceof HTMLButtonElement)) {
  throw new Error("missing #render");
}
renderBtn.addEventListener("click", render);

applyProduct("blusa");
render();
