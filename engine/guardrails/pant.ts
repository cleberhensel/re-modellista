import type { Measurements } from "../types.js";
import { createGuardrails } from "./util.js";
import type { MeasurementKey } from "./types.js";

const F = {
  waist: { label: "Cintura", step: 1, absoluteMin: 56, absoluteMax: 120 },
  hip: { label: "Quadril", step: 1, absoluteMin: 70, absoluteMax: 150 },
  crotchDepth: { label: "Gancho", step: 1, absoluteMin: 22, absoluteMax: 34 },
  inseam: { label: "Entrepernas", step: 1, absoluteMin: 60, absoluteMax: 95 },
};

function range(measurements: Measurements, key: MeasurementKey) {
  const waist = measurements.waist ?? 70;
  switch (key) {
    case "waist":
      return { min: 56, max: 120 };
    case "hip":
      return { min: Math.round(waist * 1.05), max: Math.round(waist * 1.4) };
    case "crotchDepth":
      return { min: 22, max: 34 };
    case "inseam":
      return { min: 60, max: 95 };
  }
}

export const pantGuardrails = createGuardrails("calca", F, range);
