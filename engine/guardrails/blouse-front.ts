import { buildContext } from "../context.js";
import { seventhFromBustCm } from "../seventh.js";
import type { DraftOptions, Measurements } from "../types.js";
import { dartClearsArmhole, isBlouseFrontStable, shoulderIntersects } from "./checks.js";
import type { FieldRange, FieldSpec, MeasurementKey, PieceGuardrails } from "./types.js";

const FIELDS: Record<MeasurementKey, FieldSpec> = {
  bust: { label: "Busto", step: 1, absoluteMin: 72, absoluteMax: 130 },
  height: { label: "Comprimento", step: 1, absoluteMin: 28, absoluteMax: 75 },
  waist: { label: "Cintura", step: 1, absoluteMin: 56, absoluteMax: 140 },
  wrist: { label: "Punho", step: 1, absoluteMin: 14, absoluteMax: 28 },
  sleeveLength: { label: "Manga", step: 1, absoluteMin: 18, absoluteMax: 65 },
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function roundStep(n: number, step: number): number {
  return Math.round(n / step) * step;
}

function minHeightCm(bust: number): number {
  const s = seventhFromBustCm(bust);
  return Math.ceil(s.one * 3 + s.two + 14);
}

function waistBand(bust: number): { min: number; max: number } {
  return {
    min: Math.round(bust * 0.62),
    max: Math.round(bust * 1.18),
  };
}

function mergeRange(
  spec: FieldSpec,
  dynamic: { min: number; max: number }
): FieldRange {
  const min = Math.max(spec.absoluteMin, dynamic.min);
  const max = Math.min(spec.absoluteMax, dynamic.max);
  return {
    min: min <= max ? min : max,
    max: min <= max ? max : min,
    step: spec.step,
  };
}

function getDynamicRange(
  measurements: Measurements,
  key: MeasurementKey,
  options: DraftOptions = {}
): { min: number; max: number } {
  const bust = measurements.bust;
  switch (key) {
    case "bust":
      return { min: FIELDS.bust.absoluteMin, max: FIELDS.bust.absoluteMax };
    case "height":
      return {
        min: minHeightCm(bust),
        max: FIELDS.height.absoluteMax,
      };
    case "waist":
      return waistBand(bust);
    case "wrist":
      return {
        min: FIELDS.wrist.absoluteMin,
        max: Math.min(FIELDS.wrist.absoluteMax, Math.round(bust * 0.28)),
      };
    case "sleeveLength":
      return {
        min: FIELDS.sleeveLength.absoluteMin,
        max: FIELDS.sleeveLength.absoluteMax,
      };
    default:
      return { min: 1, max: 200 };
  }
}

function clampField(
  measurements: Measurements,
  key: MeasurementKey,
  options: DraftOptions
): number {
  const spec = FIELDS[key];
  const range = mergeRange(spec, getDynamicRange(measurements, key, options));
  return roundStep(clamp(measurements[key], range.min, range.max), spec.step);
}

function stabilize(
  measurements: Measurements,
  options: DraftOptions,
  priority: MeasurementKey
): Measurements {
  let m = { ...measurements };
  const order: MeasurementKey[] = [
    priority,
    "bust",
    "height",
    "waist",
    "wrist",
    "sleeveLength",
  ];
  const seen = new Set<MeasurementKey>();
  for (const key of order) {
    if (seen.has(key)) continue;
    seen.add(key);
    m[key] = clampField(m, key, options);
  }
  if (isBlouseFrontStable(m, options)) {
    return m;
  }
  if (priority !== "bust") {
    for (let bust = m.bust; bust <= FIELDS.bust.absoluteMax; bust += 1) {
      m.bust = bust;
      m.height = clampField(m, "height", options);
      m.waist = clampField(m, "waist", options);
      if (isBlouseFrontStable(m, options)) return m;
    }
  }
  for (let height = m.height; height <= FIELDS.height.absoluteMax; height += 1) {
    m.height = height;
    if (isBlouseFrontStable(m, options)) return m;
  }
  return m;
}

export const blouseFrontGuardrails: PieceGuardrails = {
  pieceId: "blouse-front",
  fields: FIELDS,
  getFieldRange(measurements, key, options = {}) {
    const spec = FIELDS[key];
    return mergeRange(spec, getDynamicRange(measurements, key, options));
  },
  resolve(measurements, changed, options = {}) {
    const m = { ...measurements, [changed]: measurements[changed] };
    return stabilize(m, options, changed);
  },
};

export function blouseFrontStability(
  measurements: Measurements,
  options: DraftOptions = {}
): { stable: boolean; shoulder: boolean; dart: boolean } {
  const ctx = buildContext(measurements, options);
  return {
    stable: isBlouseFrontStable(measurements, options),
    shoulder: shoulderIntersects(ctx),
    dart: dartClearsArmhole(ctx),
  };
}
