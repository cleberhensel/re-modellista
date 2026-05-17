import { describe, expect, it } from "vitest";
import { draft } from "../../engine/index.js";
import { pathLength } from "../../engine/geometry/pathLength.js";
import { editablePathToSegments } from "./path-to-segments.js";
import { fromDraft } from "./from-draft.js";

describe("fromDraft", () => {
  it("converts blusa draft to document with zero revision", () => {
    const measurements = {
      bust: 90,
      height: 60,
      waist: 70,
      wrist: 16,
      sleeveLength: 58,
    };
    const result = draft(measurements, { productId: "blusa" });
    const doc = fromDraft(result, {
      productId: "blusa",
      seamAllowanceCm: 1,
    });
    expect(doc.manualEditRevision).toBe(0);
    expect(doc.pieces.length).toBeGreaterThan(0);
    const front = result.pieces.find((p) => p.id === "blouse-front");
    const docFront = doc.pieces.find((p) => p.id === "blouse-front");
    expect(front).toBeDefined();
    expect(docFront).toBeDefined();
    const solid = front!.paths.filter(
      (s) => (s.type === "line" || s.type === "cubic") && !s.dash
    );
    const motorLen = pathLength(solid);
    const cut = docFront!.paths.find((p) => p.role === "cut");
    expect(cut).toBeDefined();
    const editorLen = pathLength(editablePathToSegments(cut!));
    expect(editorLen).toBeGreaterThan(0);
    expect(Math.abs(editorLen - motorLen) / motorLen).toBeLessThan(0.2);
  });
});
