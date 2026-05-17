import { describe, expect, it } from "vitest";
import { hasManualEdits } from "./editor/document.js";
import type { PatternDocument } from "./editor/types.js";

function shouldConfirmRegenerate(doc: PatternDocument | null): boolean {
  if (!doc) return false;
  return hasManualEdits(doc) || doc.meta.editState !== "draft";
}

describe("shouldConfirmRegenerate", () => {
  const base: PatternDocument = {
    version: 1,
    unit: "cm",
    pieces: [],
    meta: {
      productId: "blusa",
      generatedAt: "",
      seamAllowanceCm: 1,
      editState: "draft",
    },
    manualEditRevision: 0,
  };

  it("skips dialog for fresh draft document", () => {
    expect(shouldConfirmRegenerate(base)).toBe(false);
  });

  it("requires dialog for dirty edits", () => {
    expect(
      shouldConfirmRegenerate({
        ...base,
        meta: { ...base.meta, editState: "dirty" },
      })
    ).toBe(true);
  });

  it("requires dialog for applied edits", () => {
    expect(
      shouldConfirmRegenerate({
        ...base,
        meta: { ...base.meta, editState: "applied" },
      })
    ).toBe(true);
  });
});
