import type { DraftOptions, Measurements } from "../types.js";
import type { FieldRange, FieldSpec, MeasurementKey, PieceGuardrails } from "./types.js";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function roundStep(n: number, step: number): number {
  return Math.round(n / step) * step;
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

export function createGuardrails(
  pieceId: string,
  fields: Partial<Record<MeasurementKey, FieldSpec>>,
  dynamicRange: (
    measurements: Measurements,
    key: MeasurementKey
  ) => { min: number; max: number }
): PieceGuardrails {
  return {
    pieceId,
    fields,
    getFieldRange(measurements, key) {
      const spec = fields[key];
      if (!spec) {
        return { min: 1, max: 200, step: 1 };
      }
      return mergeRange(spec, dynamicRange(measurements, key));
    },
    resolve(measurements, changed, options = {}) {
      const spec = fields[changed];
      if (!spec) {
        return measurements;
      }
      const range = mergeRange(spec, dynamicRange(measurements, changed));
      const value = roundStep(
        clamp(measurements[changed] as number, range.min, range.max),
        spec.step
      );
      return { ...measurements, [changed]: value };
    },
  };
}
