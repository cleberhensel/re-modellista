import { describe, expect, it } from "vitest";
import { draft } from "../../engine/index.js";
import { renderDraftToSvg } from "../../render/svg.js";
import { documentToDraftPieces } from "./from-draft.js";
import { fromDraft } from "./from-draft.js";
import { renderDocumentToSvg } from "../export/to-svg.js";
import { dashedSegmentsToPaths, splitSegmentChains } from "./segments-to-path.js";

function dashedCount(segments: { dash?: boolean; type: string }[]): number {
  return segments.filter(
    (s) => (s.type === "line" || s.type === "cubic") && s.dash
  ).length;
}

describe("segments-to-path", () => {
  it("splits disconnected dashed segments into separate chains", () => {
    const chains = splitSegmentChains([
      { type: "line", from: { x: 0, y: 0 }, to: { x: 0, y: 10 }, dash: true },
      { type: "line", from: { x: 5, y: 0 }, to: { x: 5, y: 10 }, dash: true },
    ]);
    expect(chains).toHaveLength(2);
  });

  it("preserves construction line count through editor roundtrip", () => {
    const measurements = {
      bust: 90,
      height: 60,
      waist: 70,
      wrist: 16,
      sleeveLength: 58,
    };
    const result = draft(measurements, { productId: "blusa" });
    const front = result.pieces.find((p) => p.id === "blouse-front")!;
    const originalDashed = dashedCount(front.paths);

    const doc = fromDraft(result, { productId: "blusa", seamAllowanceCm: 1 });
    const frontDoc = doc.pieces.find((p) => p.id === "blouse-front")!;
    const guidePaths = frontDoc.paths.filter((p) => p.role === "guide");
    expect(guidePaths.length).toBe(originalDashed);

    const roundtrip = documentToDraftPieces(doc).find((p) => p.id === "blouse-front")!;
    expect(dashedCount(roundtrip.paths)).toBe(originalDashed);

    const v1 = renderDraftToSvg(result, { seamAllowanceCm: 1 });
    const v2 = renderDocumentToSvg(doc, { seamAllowanceCm: 1 });
    expect(v1).toContain('stroke-dasharray="8 5"');
    expect(v2).toContain('stroke-dasharray="8 5"');
  });
});
