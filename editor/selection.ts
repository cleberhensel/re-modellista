export type Selection =
  | { kind: "none" }
  | { kind: "piece"; pieceId: string }
  | { kind: "edge"; pieceId: string; pathId: string; edgeIndex: number }
  | { kind: "node"; pieceId: string; pathId: string; nodeId: string };

export function selectionIsNone(sel: Selection): sel is { kind: "none" } {
  return sel.kind === "none";
}
