import { draft, getGuardrails, isBlouseStable } from "./engine/index.js";
import type {
  DraftOptions,
  DraftResult,
  Measurements,
  PartSlotId,
} from "./engine/types.js";
import type { MeasurementKey } from "./engine/guardrails/types.js";
import {
  getCompositionPreset,
  getProduct,
  listCatalogGroups,
  type ProductId,
} from "./catalog/products.js";
import { exportDraftToPdf, pdfFilename } from "./render/pdf.js";
import type { RenderOptions } from "./render/svg.js";
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
let lastDraftResult: DraftResult | null = null;

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

const SLOT_OPTION_KEY: Record<
  PartSlotId,
  keyof DraftOptions | null
> = {
  bodice: null,
  skirt: null,
  pant: null,
  sleeve: "includeSleeve",
  collar: "includeCollar",
  cuff: "includeCuff",
  placket: "includePlacket",
  chestPocket: "includeChestPocket",
  sidePocket: "includeSidePocket",
  waistband: "includeWaistband",
};

function compositionPanel(): HTMLElement | null {
  const el = document.getElementById("composition-panel");
  return el instanceof HTMLElement ? el : null;
}

function slotCheckbox(slot: PartSlotId): HTMLInputElement | null {
  const panel = compositionPanel();
  if (!panel) return null;
  const el = panel.querySelector(`input[data-slot="${slot}"]`);
  return el instanceof HTMLInputElement ? el : null;
}

function readCompositionOptions(): Partial<DraftOptions> {
  const product = getProduct(currentProductId);
  if (!product?.compositionFields?.length || !compositionPanel()) {
    return {};
  }
  const opts: Partial<DraftOptions> = {};
  for (const slot of product.compositionFields) {
    const key = SLOT_OPTION_KEY[slot];
    if (!key) continue;
    const input = slotCheckbox(slot);
    if (!input) continue;
    opts[key] = input.checked;
  }
  const presetEl = document.getElementById("sleeve-length-preset");
  if (presetEl instanceof HTMLSelectElement && presetEl.value) {
    opts.sleevePreset = presetEl.value as DraftOptions["sleevePreset"];
  }
  return opts;
}

function compositionPresetSelect(): HTMLSelectElement | null {
  const el = document.getElementById("composition-preset");
  return el instanceof HTMLSelectElement ? el : null;
}

function syncCompositionPresetSelect(): void {
  const select = compositionPresetSelect();
  const product = getProduct(currentProductId);
  if (!select || !product?.compositionPresets?.length) return;
  const current = select.value;
  select.innerHTML = "";
  for (const preset of product.compositionPresets) {
    const opt = document.createElement("option");
    opt.value = preset.id;
    opt.textContent = preset.label;
    select.appendChild(opt);
  }
  const defaultId = product.defaultCompositionPresetId ?? "custom";
  const hasCurrent = product.compositionPresets.some((p) => p.id === current);
  select.value = hasCurrent ? current : defaultId;
}

function applyOptionsToCompositionToggles(
  options: Partial<DraftOptions>
): void {
  const product = getProduct(currentProductId)!;
  for (const slot of product.compositionFields ?? []) {
    const key = SLOT_OPTION_KEY[slot];
    if (!key) continue;
    const input = slotCheckbox(slot);
    if (!input) continue;
    if (typeof options[key] === "boolean") {
      input.checked = options[key] as boolean;
    }
  }
  const lengthPreset = document.getElementById("sleeve-length-preset");
  if (lengthPreset instanceof HTMLSelectElement) {
    lengthPreset.value = options.sleevePreset ?? "";
  }
}

function applyCompositionPresetById(presetId: string): void {
  if (!compositionPanel()) return;
  const select = compositionPresetSelect();
  if (select) select.value = presetId;
  if (presetId === "custom") {
    syncCompositionVisibility();
    return;
  }
  const preset = getCompositionPreset(currentProductId, presetId);
  if (!preset) return;
  applyOptionsToCompositionToggles(preset.options);
  syncCompositionVisibility();
}

function markCompositionCustom(): void {
  const select = compositionPresetSelect();
  if (select && select.value !== "custom") {
    select.value = "custom";
  }
}

function syncCompositionVisibility(): void {
  const product = getProduct(currentProductId)!;
  const panel = compositionPanel();
  const section = document.getElementById("composition-section");
  if (!panel) return;
  const hasComposition = (product.compositionFields?.length ?? 0) > 0;
  panel.classList.toggle("hidden", !hasComposition);
  if (section instanceof HTMLElement) {
    section.classList.toggle("hidden", !hasComposition);
  }
  if (!hasComposition) return;

  const allowed = new Set(product.compositionFields ?? []);
  for (const label of panel.querySelectorAll<HTMLElement>(
    ".composition-toggle"
  )) {
    const slot = label.dataset.slot as PartSlotId | undefined;
    if (!slot) continue;
    label.classList.toggle("hidden", !allowed.has(slot));
  }

  const sleeveInput = slotCheckbox("sleeve");
  const sleeveOn = allowed.has("sleeve") && !!sleeveInput?.checked;
  if (allowed.has("cuff")) {
    const cuff = slotCheckbox("cuff");
    if (cuff) {
      cuff.disabled = !sleeveOn;
      if (!sleeveOn) cuff.checked = false;
    }
  }

  const presetRow = document.getElementById("sleeve-preset-row");
  if (presetRow instanceof HTMLElement) {
    presetRow.classList.toggle("hidden", !sleeveOn);
  }
  const sleeveMeasure = document.querySelector('[data-measure="sleeve"]');
  if (sleeveMeasure instanceof HTMLElement) {
    sleeveMeasure.classList.toggle("hidden", !sleeveOn && allowed.has("sleeve"));
  }
}

function applyCompositionDefaults(): void {
  if (!compositionPanel()) return;
  syncCompositionPresetSelect();
  const product = getProduct(currentProductId)!;
  const presetId = product.defaultCompositionPresetId ?? "custom";
  const preset = getCompositionPreset(currentProductId, presetId);
  if (preset && presetId !== "custom") {
    applyCompositionPresetById(presetId);
    return;
  }
  applyOptionsToCompositionToggles(product.compositionDefaults ?? {});
  syncCompositionVisibility();
}

function renderOptions(): RenderOptions {
  const options = draftOptions();
  return {
    seamAllowanceCm: options.seamAllowanceCm ?? 1,
    pxPerCm: options.pxPerCm,
  };
}

function draftOptions(): DraftOptions {
  const product = getProduct(currentProductId)!;
  const presetId = compositionPresetSelect()?.value ?? "custom";
  const preset = getCompositionPreset(currentProductId, presetId);
  const staticDefaults: Partial<DraftOptions> = {};
  if (product.compositionDefaults?.fabricProfileId) {
    staticDefaults.fabricProfileId = product.compositionDefaults.fabricProfileId;
  }
  if (product.compositionDefaults?.legLengthCm != null) {
    staticDefaults.legLengthCm = product.compositionDefaults.legLengthCm;
  }
  return {
    productId: currentProductId,
    ...staticDefaults,
    ...(presetId !== "custom" ? preset?.options : {}),
    ...readCompositionOptions(),
  };
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
  syncCompositionPresetSelect();
  for (const key of product.measureKeys) {
    const domId = SLIDER_DOM[key] ?? key;
    const def = product.defaults[key];
    if (def !== undefined) {
      sliderEl(domId).value = String(def);
    }
  }
  syncMeasureVisibility();
  applyCompositionDefaults();
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
      activeSlots: result.activeSlots,
      meta: result.meta,
      k: "k" in ctx ? ctx.k : undefined,
    },
    null,
    2
  );
  previewEl.innerHTML = renderDraftToSvg(result, renderOptions());
  lastDraftResult = result;
  const downloadBtn = document.getElementById("download-pdf");
  if (downloadBtn instanceof HTMLButtonElement) {
    const hasPieces = result.pieces.some((p) => p.paths.length > 0);
    downloadBtn.disabled = !hasPieces || !!result.error;
  }
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

function initComposition(): void {
  const panel = compositionPanel();
  if (!panel) return;
  for (const input of panel.querySelectorAll<HTMLInputElement>(
    'input[data-slot]'
  )) {
    input.addEventListener("change", () => {
      markCompositionCustom();
      syncCompositionVisibility();
      render();
    });
  }
  const presetSelect = compositionPresetSelect();
  if (presetSelect) {
    presetSelect.addEventListener("change", () => {
      applyCompositionPresetById(presetSelect.value);
      render();
    });
  }
  const lengthPreset = document.getElementById("sleeve-length-preset");
  if (lengthPreset instanceof HTMLSelectElement) {
    lengthPreset.addEventListener("change", () => {
      markCompositionCustom();
      render();
    });
  }
}

syncProductSelect();
initSliders();
initComposition();
productSelect().addEventListener("change", () => {
  applyProduct(productSelect().value as ProductId);
  render();
});

const downloadPdfBtn = document.getElementById("download-pdf");
if (!(downloadPdfBtn instanceof HTMLButtonElement)) {
  throw new Error("missing #download-pdf");
}
downloadPdfBtn.disabled = true;
downloadPdfBtn.addEventListener("click", async () => {
  const draftResult = lastDraftResult;
  if (!draftResult) return;
  downloadPdfBtn.disabled = true;
  const label = downloadPdfBtn.textContent;
  downloadPdfBtn.textContent = "A gerar PDF…";
  try {
    const blob = await exportDraftToPdf(draftResult, renderOptions());
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = pdfFilename(draftResult.productId);
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    window.alert("Não foi possível gerar o PDF. Gere o molde primeiro.");
  } finally {
    downloadPdfBtn.textContent = label;
    const hasPieces =
      lastDraftResult?.pieces.some((p) => p.paths.length > 0) ?? false;
    downloadPdfBtn.disabled = !hasPieces || !!lastDraftResult?.error;
  }
});

applyProduct("blusa");
render();
