export interface BodiceMeasurements {
  bust: number;
  height: number;
  waist: number;
  wrist: number;
  sleeveLength: number;
}

export interface SkirtMeasurements {
  waist: number;
  hip: number;
  hipDepth: number;
  skirtLength: number;
}

export interface PantMeasurements {
  waist: number;
  hip: number;
  crotchDepth?: number;
  inseam: number;
  outseam?: number;
}

export interface DressMeasurements extends BodiceMeasurements {
  bodiceLength: number;
  hip: number;
  hipDepth: number;
  skirtLength: number;
}

export interface CoatMeasurements extends BodiceMeasurements {
  designEaseBust: number;
  coatLength: number;
}

export type Measurements = BodiceMeasurements &
  Partial<SkirtMeasurements> &
  Partial<PantMeasurements> &
  Partial<Pick<DressMeasurements, "bodiceLength">> &
  Partial<Pick<CoatMeasurements, "designEaseBust" | "coatLength">>;

export interface SeventhCm {
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
  six: number;
  seven: number;
}

export interface SeventhPx {
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
  six: number;
  seven: number;
}

export interface DraftFormulas {
  bustQuarterCm: number;
  bustHalfCm: number;
  seventhOneCm: number;
  seventhTwoCm: number;
  seventhFourCm: number;
  widthPx: number;
  heightPx: number;
  hipPx: number;
  shoulderY: number;
  armholeLineY: number;
}

export interface DraftContext {
  measurements: Measurements;
  draftOptions: DraftOptions;
  k: number;
  margin: number;
  start: number;
  startOne: number;
  startTwo: number;
  widthPx: number;
  heightPx: number;
  hipPx: number;
  seventh: SeventhCm;
  s: SeventhPx;
  formulas: DraftFormulas;
}

export interface SkirtContext {
  measurements: SkirtMeasurements;
  k: number;
  startOne: number;
  waistFrontQuarterPx: number;
  waistBackQuarterPx: number;
  hipQuarterPx: number;
  hipLineY: number;
  hemY: number;
}

export interface PantContext {
  measurements: PantMeasurements;
  k: number;
  startOne: number;
  waistQuarterPx: number;
  hipQuarterPx: number;
  crotchLineY: number;
  outseamPx: number;
  frontExtension: number;
  backExtension: number;
}

export interface Point2 {
  x: number;
  y: number;
}

export type PathSegment =
  | { type: "move"; to: Point2 }
  | { type: "line"; from: Point2; to: Point2; dash?: boolean }
  | {
      type: "cubic";
      from: Point2;
      cp1: Point2;
      cp2: Point2;
      to: Point2;
      dash?: boolean;
    };

export interface PatternPiece {
  id: string;
  paths: PathSegment[];
  points?: Record<string, unknown>;
  error?: string;
  note?: string;
}

export interface DraftBounds {
  width: number;
  height: number;
}

export type PartSlotId =
  | "bodice"
  | "sleeve"
  | "collar"
  | "cuff"
  | "placket"
  | "chestPocket"
  | "sidePocket"
  | "skirt"
  | "pant"
  | "waistband";

export interface DraftResult {
  productId: string;
  ctx: DraftContext | SkirtContext | PantContext;
  pieces: PatternPiece[];
  bounds: DraftBounds;
  activeSlots?: PartSlotId[];
  meta?: Record<string, number>;
  error?: string;
}

export interface DraftOptions {
  productId?: string;
  pxPerCm?: number;
  marginCm?: number;
  sleeveless?: boolean;
  armholeDepthOffsetCm?: number;
  suppressDarts?: boolean;
  designEaseBust?: number;
  coatLength?: number;
  fabricProfileId?: string;
  includeWaistband?: boolean;
  legLengthCm?: number;
  sleeveCapScale?: number;
  includeSleeve?: boolean;
  includeCollar?: boolean;
  includeCuff?: boolean;
  includePlacket?: boolean;
  includeChestPocket?: boolean;
  includeSidePocket?: boolean;
  sleevePreset?: "short" | "threeQuarter" | "long";
  lockedSlots?: PartSlotId[];
}
