import { describe, expect, it } from "vitest";
import {
  createViewport,
  fitToDocument,
  visibleWorldBounds,
} from "./viewport.js";
import { createEmptyDocument } from "../document.js";

describe("viewport grid helpers", () => {
  it("computes visible world bounds from pan and scale", () => {
    const v = createViewport();
    v.panX = 40;
    v.panY = 40;
    v.scale = 1;
    const b = visibleWorldBounds(v, 800, 600, 0);
    expect(b.minX).toBeCloseTo(-40, 0);
    expect(b.minY).toBeCloseTo(-40, 0);
    expect(b.maxX).toBeCloseTo(760, 0);
    expect(b.maxY).toBeCloseTo(560, 0);
  });

  it("editor initial fit zooms closer than default fit", () => {
    const doc = createEmptyDocument();
    const defaultV = createViewport();
    const editorV = createViewport();
    fitToDocument(defaultV, doc, 800, 500);
    fitToDocument(editorV, doc, 800, 500, { padding: 14, zoomFactor: 1.75 });
    expect(editorV.scale).toBeGreaterThan(defaultV.scale);
  });

  it("contentInsetLeft shifts pan right for sidebar clearance", () => {
    const doc = createEmptyDocument();
    const full = createViewport();
    const inset = createViewport();
    fitToDocument(full, doc, 800, 500, { padding: 40 });
    fitToDocument(inset, doc, 800, 500, { padding: 40, contentInsetLeft: 250 });
    expect(inset.panX).toBeGreaterThan(full.panX);
  });
});
