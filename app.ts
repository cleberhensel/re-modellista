import { draft, getGuardrails, isBlouseFrontStable } from "./engine/index.js";
import type { DraftOptions, Measurements } from "./engine/types.js";
import type { MeasurementKey } from "./engine/guardrails/types.js";
import { renderDraftToSvg } from "./render/svg.js";

const PIECE_ID = "blouse-front";

const SLIDER_FIELDS: { domId: string; key: MeasurementKey }[] = [
  { domId: "bust", key: "bust" },
  { domId: "height", key: "height" },
  { domId: "waist", key: "waist" },
  { domId: "wrist", key: "wrist" },
  { domId: "sleeve", key: "sleeveLength" },
];

function sliderEl(id: string): HTMLInputElement {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement)) {
    throw new Error(`missing slider #${id}`);
  }
  return el;
}

function outputEl(id: string): HTMLOutputElement {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLOutputElement)) {
    throw new Error(`missing output #${id}`);
  }
  return el;
}

function readMeasurements(): Measurements {
  return {
    bust: Number(sliderEl("bust").value),
    height: Number(sliderEl("height").value),
    waist: Number(sliderEl("waist").value),
    wrist: Number(sliderEl("wrist").value),
    sleeveLength: Number(sliderEl("sleeve").value),
  };
}

function draftOptions(): DraftOptions {
  return {};
}

function syncSliders(
  measurements: Measurements,
  options: DraftOptions
): void {
  const guardrails = getGuardrails(PIECE_ID);
  for (const { domId, key } of SLIDER_FIELDS) {
    const range = guardrails.getFieldRange(measurements, key, options);
    const slider = sliderEl(domId);
    slider.min = String(range.min);
    slider.max = String(range.max);
    slider.step = String(range.step);
    slider.value = String(measurements[key]);
    outputEl(`${domId}-out`).textContent = String(measurements[key]);
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
  if (isBlouseFrontStable(measurements, options)) {
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
  const resolved = getGuardrails(PIECE_ID).resolve(
    measurements,
    changed,
    options
  );
  syncSliders(resolved, options);
  updateGuardrailHint(resolved, options);
  return resolved;
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
  formulasEl.textContent = JSON.stringify(result.ctx.formulas, null, 2);
  contextEl.textContent = JSON.stringify(
    {
      k: result.ctx.k,
      start: result.ctx.start,
      seventh: result.ctx.seventh,
      s: result.ctx.s,
    },
    null,
    2
  );
  previewEl.innerHTML = renderDraftToSvg(result);
  const piece = result.pieces[0];
  if (piece?.error) {
    previewEl.insertAdjacentHTML(
      "beforeend",
      `<p class="draft-error">${piece.error}</p>`
    );
  }
}

function onSliderInput(domId: string): void {
  const field = SLIDER_FIELDS.find((f) => f.domId === domId);
  if (!field) return;
  applyMeasurements(readMeasurements(), field.key, draftOptions());
  render();
}

for (const { domId } of SLIDER_FIELDS) {
  sliderEl(domId).addEventListener("input", () => onSliderInput(domId));
}

const renderBtn = document.getElementById("render");
if (!(renderBtn instanceof HTMLButtonElement)) {
  throw new Error("missing #render");
}
renderBtn.addEventListener("click", render);

applyMeasurements(readMeasurements(), "bust", draftOptions());
render();
