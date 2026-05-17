import { describe, expect, it } from "vitest";
import { draft } from "../../engine/index.js";
import { renderDraftToSvg } from "../../render/svg.js";
import { fromDraft } from "../adapters/from-draft.js";
import { renderDocumentToSvg } from "./to-svg.js";

describe("renderDocumentToSvg", () => {
  it("matches draft svg before edits", () => {
    const measurements = {
      bust: 90,
      height: 60,
      waist: 70,
      wrist: 16,
      sleeveLength: 58,
    };
    const result = draft(measurements, { productId: "blusa" });
    const v1 = renderDraftToSvg(result, { seamAllowanceCm: 1 });
    const doc = fromDraft(result, { productId: "blusa", seamAllowanceCm: 1 });
    const v2 = renderDocumentToSvg(doc, { seamAllowanceCm: 1 });
    expect(v2).toContain("<svg");
    expect(v1).toContain("blouse-front");
    expect(v2).toContain("blouse-front");
  });
});
