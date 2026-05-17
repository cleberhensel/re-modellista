import type { Point2 } from "../../engine/types.js";

export type GuideKind =
  | "cf_axis"
  | "shoulder_line"
  | "dart_center"
  | "dart_plus"
  | "dart_minus"
  | "grain";

export type AnchorKey =
  | "cf_neck"
  | "cf_hem"
  | "side_bottom"
  | "shoulder_start"
  | "shoulder_end"
  | "intersection"
  | "dart_hip"
  | "waist_side";

export interface ConstructionScalars {
  dartOffsetFromSide: number;
  dartSpreadRatio: number;
  dartTopOffsetRatio: number;
  dartApexOffsetFromHemY: number;
  dartSpreadPx: number;
  grainOffsetFromSide: number;
  suppressDarts: boolean;
}

export interface PieceConstructionState {
  profileId: string;
  scalars: ConstructionScalars;
  anchorBindings: Partial<Record<AnchorKey, string>>;
  impactByNode: Record<string, GuideKind[]>;
}

export interface ResolvedAnchors {
  cf_neck: Point2;
  cf_hem: Point2;
  side_bottom: Point2;
  shoulder_start: Point2;
  shoulder_end: Point2;
  intersection: Point2;
  dart_hip?: Point2;
  waist_side?: Point2;
  hemY: number;
  dartCenterX: number;
  dartTopY: number;
  dartSpread: number;
  dartFootCenter: Point2;
  dartFootPlus: Point2;
  dartFootMinus: Point2;
  grainCenterX: number;
  grainTop: Point2;
  grainBottom: Point2;
}

export interface ConstructionProfile {
  id: string;
  guideOrder: GuideKind[];
  guideDependsOn: Partial<Record<GuideKind, AnchorKey[]>>;
}
