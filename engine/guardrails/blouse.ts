import { buildContext } from "../context.js";
import { seventhFromBustCm } from "../seventh.js";
import type { DraftOptions, Measurements } from "../types.js";
import {
  dartClearsArmhole,
  isBlouseStable,
  shoulderBackIntersects,
  shoulderIntersects,
} from "./checks.js";
import type { FieldRange, FieldSpec, MeasurementKey, PieceGuardrails } from "./types.js";

const FIELDS: Partial<Record<MeasurementKey, FieldSpec>> = {
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
  key: MeasurementKey
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
  }
}

function clampField(measurements: Measurements, key: MeasurementKey): number {
  const spec = FIELDS[key]!;
  const range = mergeRange(spec, getDynamicRange(measurements, key));
  const value = measurements[key as keyof Measurements] as number;
  return roundStep(clamp(value, range.min, range.max), spec.step);
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
    m[key as keyof Measurements] = clampField(m, key) as never;
  }
  if (isBlouseStable(m, options)) {
    return m;
  }
  if (priority !== "bust") {
    for (let bust = m.bust; bust <= FIELDS.bust!.absoluteMax; bust += 1) {
      m.bust = bust;
      m.height = clampField(m, "height");
      m.waist = clampField(m, "waist");
      if (isBlouseStable(m, options)) return m;
    }
  }
  for (let height = m.height; height <= FIELDS.height!.absoluteMax; height += 1) {
    m.height = height;
    if (isBlouseStable(m, options)) return m;
  }
  return m;
}

export const blouseGuardrails: PieceGuardrails = {
  pieceId: "blusa",
  fields: FIELDS,
  getFieldRange(measurements, key) {
    const spec = FIELDS[key];
    if (!spec) {
      return { min: 1, max: 200, step: 1 };
    }
    return mergeRange(spec, getDynamicRange(measurements, key));
  },
  resolve(measurements, changed, options = {}) {
    const m = { ...measurements, [changed]: measurements[changed] };
    return stabilize(m, options, changed);
  },
};

export function blouseStability(
  measurements: Measurements,
  options: DraftOptions = {}
): { stable: boolean; shoulder: boolean; dart: boolean } {
  const ctx = buildContext(measurements, options);
  return {
    stable: isBlouseStable(measurements, options),
    shoulder: shoulderIntersects(ctx) && shoulderBackIntersects(ctx),
    dart: dartClearsArmhole(ctx),
  };
}
