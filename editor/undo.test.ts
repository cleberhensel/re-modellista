import { describe, expect, it } from "vitest";
import { UndoStack } from "./undo.js";
import { createEmptyDocument } from "./document.js";

describe("UndoStack", () => {
  it("undo restores prior state", () => {
    const stack = new UndoStack();
    const a = createEmptyDocument();
    a.manualEditRevision = 0;
    const b = createEmptyDocument();
    b.manualEditRevision = 1;
    stack.push(a);
    const restored = stack.undo(b);
    expect(restored?.manualEditRevision).toBe(0);
  });

  it("redo after undo", () => {
    const stack = new UndoStack();
    const a = createEmptyDocument();
    const b = createEmptyDocument();
    b.manualEditRevision = 2;
    stack.push(a);
    stack.undo(b);
    const redone = stack.redo(a);
    expect(redone?.manualEditRevision).toBe(2);
  });
});
