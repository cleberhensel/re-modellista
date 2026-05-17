import { describe, expect, it } from "vitest";
import type { PatternDocument } from "./editor/types.js";

function hasSavedPatternView(doc: PatternDocument | null): boolean {
  return doc !== null && doc.meta.editState !== "draft";
}

function shouldConfirmRegenerate(doc: PatternDocument | null): boolean {
  if (!doc) return false;
  return hasSavedPatternView(doc);
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
