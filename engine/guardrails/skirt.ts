import type { Measurements } from "../types.js";
import { createGuardrails } from "./util.js";
import type { MeasurementKey } from "./types.js";

const F = {
  waist: { label: "Cintura", step: 1, absoluteMin: 56, absoluteMax: 120 },
  hip: { label: "Quadril", step: 1, absoluteMin: 56, absoluteMax: 140 },
  hipDepth: { label: "Altura quadril", step: 1, absoluteMin: 18, absoluteMax: 26 },
  skirtLength: { label: "Comprimento", step: 1, absoluteMin: 30, absoluteMax: 90 },
};

function range(measurements: Measurements, key: MeasurementKey) {
  const waist = measurements.waist ?? 70;
  switch (key) {
    case "waist":
      return { min: 56, max: 120 };
    case "hip":
      return { min: waist, max: Math.round(waist * 1.35) };
    case "hipDepth":
      return { min: 18, max: 26 };
    case "skirtLength":
      return { min: 30, max: 90 };
  }
}

export const skirtGuardrails = createGuardrails("saia-reta", F, range);
