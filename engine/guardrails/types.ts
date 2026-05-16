import type { DraftOptions, Measurements } from "../types.js";

export type MeasurementKey = keyof Measurements;

export interface FieldSpec {
  label: string;
  step: number;
  absoluteMin: number;
  absoluteMax: number;
}

export interface FieldRange {
  min: number;
  max: number;
  step: number;
}

export interface PieceGuardrails {
  pieceId: string;
  fields: Record<MeasurementKey, FieldSpec>;
  getFieldRange(
    measurements: Measurements,
    key: MeasurementKey,
    options?: DraftOptions
  ): FieldRange;
  resolve(
    measurements: Measurements,
    changed: MeasurementKey,
    options?: DraftOptions
  ): Measurements;
}
