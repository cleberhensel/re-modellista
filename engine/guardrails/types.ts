import type { DraftOptions, Measurements } from "../types.js";

export type MeasurementKey =
  | keyof BodiceMeasurements
  | keyof SkirtMeasurements
  | keyof PantMeasurements
  | "bodiceLength"
  | "designEaseBust"
  | "coatLength";

import type {
  BodiceMeasurements,
  SkirtMeasurements,
  PantMeasurements,
} from "../types.js";

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
  fields: Partial<Record<MeasurementKey, FieldSpec>>;
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
