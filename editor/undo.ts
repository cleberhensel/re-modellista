import { cloneDocument } from "./document.js";
import type { PatternDocument } from "./types.js";

const MAX_STACK = 50;

export class UndoStack {
  private past: PatternDocument[] = [];
  private future: PatternDocument[] = [];

  push(before: PatternDocument): void {
    this.past.push(cloneDocument(before));
    if (this.past.length > MAX_STACK) {
      this.past.shift();
    }
    this.future = [];
  }

  undo(current: PatternDocument): PatternDocument | null {
    if (this.past.length === 0) return null;
    this.future.push(cloneDocument(current));
    return this.past.pop() ?? null;
  }

  redo(current: PatternDocument): PatternDocument | null {
    if (this.future.length === 0) return null;
    this.past.push(cloneDocument(current));
    return this.future.pop() ?? null;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  clear(): void {
    this.past = [];
    this.future = [];
  }
}
