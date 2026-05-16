import type { Measurements } from "../types.js";
import { createGuardrails } from "./util.js";
import type { MeasurementKey } from "./types.js";
import { blouseGuardrails } from "./blouse.js";

const F = {
  bust: { label: "Busto", step: 1, absoluteMin: 72, absoluteMax: 130 },
  coatLength: { label: "Comprimento", step: 1, absoluteMin: 50, absoluteMax: 95 },
  waist: { label: "Cintura", step: 1, absoluteMin: 56, absoluteMax: 140 },
  wrist: { label: "Punho", step: 1, absoluteMin: 14, absoluteMax: 28 },
  sleeveLength: { label: "Manga", step: 1, absoluteMin: 18, absoluteMax: 65 },
  designEaseBust: { label: "Folga busto", step: 1, absoluteMin: 2, absoluteMax: 12 },
};

function range(measurements: Measurements, key: MeasurementKey) {
  if (key === "designEaseBust") return { min: 2, max: 12 };
  if (key === "coatLength") return { min: 50, max: 95 };
  return blouseGuardrails.getFieldRange(measurements, key);
}

export const coatGuardrails = createGuardrails("casaco", F, range);
