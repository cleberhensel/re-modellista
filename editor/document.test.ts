import { describe, expect, it, beforeEach } from "vitest";
import {
  applyManualEdits,
  cloneDocument,
  createEmptyDocument,
  hasManualEdits,
  insertNodeOnEdge,
  moveNode,
  removeNode,
  resetIdCounter,
} from "./document.js";
import type { PatternDocument } from "./types.js";

function sampleDoc(): PatternDocument {
  resetIdCounter();
  return {
    version: 1,
    unit: "cm",
    manualEditRevision: 0,
    meta: {
      productId: "blusa",
      generatedAt: "",
      seamAllowanceCm: 1,
      editState: "draft",
    },
    pieces: [
      {
        id: "test",
        label: "Test",
        layout: { x: 0, y: 0 },
        annotations: [],
        paths: [
          {
            id: "cut-0",
            role: "cut",
            closed: true,
            segmentKinds: ["line", "line", "line"],
            nodes: [
              { id: "n1", x: 0, y: 0 },
              { id: "n2", x: 10, y: 0 },
              { id: "n3", x: 5, y: 10 },
            ],
          },
        ],
      },
    ],
  };
}

describe("document", () => {
  beforeEach(() => resetIdCounter());

  it("moveNode increments revision", () => {
    const doc = sampleDoc();
    moveNode(doc, "test", "cut-0", "n1", 1, 1);
    expect(doc.manualEditRevision).toBe(1);
    expect(doc.meta.editState).toBe("dirty");
  });

  it("removeNode blocks below minimum", () => {
    const doc = sampleDoc();
    expect(removeNode(doc, "test", "cut-0", "n1")).toBe(false);
  });

  it("insertNodeOnEdge adds vertex", () => {
    const doc = sampleDoc();
    const id = insertNodeOnEdge(doc, "test", "cut-0", 0, 0.5);
    expect(id).toBeTruthy();
    expect(doc.pieces[0]!.paths[0]!.nodes).toHaveLength(4);
  });

  it("applyManualEdits clears dirty state", () => {
    const doc = sampleDoc();
    moveNode(doc, "test", "cut-0", "n1", 1, 1);
    applyManualEdits(doc);
    expect(doc.meta.editState).toBe("applied");
    expect(hasManualEdits(doc)).toBe(false);
  });

  it("cloneDocument is independent", () => {
    const doc = sampleDoc();
    const copy = cloneDocument(doc);
    copy.pieces[0]!.paths[0]!.nodes[0]!.x = 99;
    expect(doc.pieces[0]!.paths[0]!.nodes[0]!.x).toBe(0);
  });
});
