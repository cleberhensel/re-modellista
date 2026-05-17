export interface Point2 {
  x: number;
  y: number;
}

export interface PathNode {
  id: string;
  x: number;
  y: number;
  handleIn?: Point2;
  handleOut?: Point2;
}

export type PathRole = "cut" | "seam" | "fold" | "grain" | "notch" | "guide";

export type SegmentKind = "line" | "cubic";

export interface EditablePath {
  id: string;
  role: PathRole;
  closed: boolean;
  nodes: PathNode[];
  segmentKinds: SegmentKind[];
}

export interface NotchAnnotation {
  id: string;
  pathId: string;
  edgeIndex: number;
  t: number;
  side: "in" | "out";
  depthCm: number;
}

export interface GrainlineAnnotation {
  id: string;
  from: Point2;
  to: Point2;
}

export type PieceAnnotation = NotchAnnotation | GrainlineAnnotation;

export interface EditablePiece {
  id: string;
  label: string;
  paths: EditablePath[];
  layout: { x: number; y: number; rotation?: number };
  layoutManual?: boolean;
  annotations: PieceAnnotation[];
}

export interface PatternDocument {
  version: 1;
  unit: "cm";
  pieces: EditablePiece[];
  meta: {
    productId: string;
    generatedAt: string;
    seamAllowanceCm: number;
    pxPerCm?: number;
    editState: "draft" | "dirty" | "applied";
  };
  manualEditRevision: number;
}
