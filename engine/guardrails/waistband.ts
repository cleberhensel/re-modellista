import type { Measurements } from "../types.js";
import { createGuardrails } from "./util.js";
import type { MeasurementKey } from "./types.js";

const F = {
  waist: { label: "Cintura", step: 1, absoluteMin: 56, absoluteMax: 120 },
  height: { label: "Altura cós", step: 0.5, absoluteMin: 3, absoluteMax: 5 },
};

function range(_m: Measurements, key: MeasurementKey) {
  if (key === "waist") return { min: 56, max: 120 };
  return { min: 3, max: 5 };
}

export const waistbandGuardrails = createGuardrails("cos", F, range);
