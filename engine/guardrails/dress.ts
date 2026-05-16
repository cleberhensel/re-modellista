import type { Measurements } from "../types.js";
import { createGuardrails } from "./util.js";
import type { MeasurementKey } from "./types.js";
import { blouseGuardrails } from "./blouse.js";

const F = {
  bust: { label: "Busto", step: 1, absoluteMin: 72, absoluteMax: 130 },
  bodiceLength: { label: "Corpo", step: 1, absoluteMin: 28, absoluteMax: 50 },
  waist: { label: "Cintura", step: 1, absoluteMin: 56, absoluteMax: 140 },
  hip: { label: "Quadril", step: 1, absoluteMin: 56, absoluteMax: 140 },
  hipDepth: { label: "Altura quadril", step: 1, absoluteMin: 18, absoluteMax: 26 },
  skirtLength: { label: "Saia", step: 1, absoluteMin: 30, absoluteMax: 90 },
  wrist: { label: "Punho", step: 1, absoluteMin: 14, absoluteMax: 28 },
  sleeveLength: { label: "Manga", step: 1, absoluteMin: 18, absoluteMax: 65 },
};

function range(measurements: Measurements, key: MeasurementKey) {
  if (key === "bust" || key === "waist" || key === "wrist" || key === "sleeveLength") {
    return blouseGuardrails.getFieldRange(measurements, key);
  }
  const waist = measurements.waist ?? 70;
  switch (key) {
    case "bodiceLength":
      return { min: 28, max: 50 };
    case "hip":
      return { min: waist, max: Math.round(waist * 1.35) };
    case "hipDepth":
      return { min: 18, max: 26 };
    case "skirtLength":
      return { min: 30, max: 90 };
  }
}

export const dressGuardrails = createGuardrails("vestido", F, range);
