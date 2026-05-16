export interface Measurements {
  bust: number;
  height: number;
  waist: number;
  wrist: number;
  sleeveLength: number;
}

export interface SeventhScale {
  one: number;
  two: number;
  four: number;
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
    };

export interface FormulaResults {
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
  k: number;
  margin: number;
  start: number;
  startOne: number;
  startTwo: number;
  widthPx: number;
  heightPx: number;
  hipPx: number;
  seventh: SeventhScale;
  s: SeventhScale;
  formulas: FormulaResults;
}

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

export interface DraftResult {
  ctx: DraftContext;
  pieces: PatternPiece[];
  bounds: DraftBounds;
}

export interface DraftOptions {
  pxPerCm?: number;
  marginCm?: number;
  piece?: "front" | "back";
}
