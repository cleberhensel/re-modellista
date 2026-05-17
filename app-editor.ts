import type { DraftResult } from "./engine/types.js";
import type { RenderOptions } from "./render/svg.js";
import { fromDraft } from "./editor/adapters/from-draft.js";
import {
  applyManualEdits,
  hasManualEdits,
  shouldPreserveEditorDocument,
} from "./editor/document.js";
import type { PatternDocument } from "./editor/types.js";
import { CanvasController } from "./editor/canvas/mount.js";
import { renderDocumentToSvg } from "./editor/export/to-svg.js";

const EDITOR_STORAGE_KEY = "remodellista.editorMode";

let editorEnabled = false;
let patternDocument: PatternDocument | null = null;
let canvasController: CanvasController | null = null;
let pendingRegenerateAction: (() => void) | null = null;

export function isEditorEnabled(): boolean {
  return editorEnabled;
}

export function getPatternDocument(): PatternDocument | null {
  return patternDocument;
}

function saveEditorModePreference(enabled: boolean): void {
  try {
    localStorage.setItem(EDITOR_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement
  );
}

function syncEditorChrome(): void {
  const toolbar = document.getElementById("editor-toolbar");
  const applyBtn = document.getElementById("editor-apply-edits");
  const resetBtn = document.getElementById("editor-reset-edits");
  if (toolbar) toolbar.hidden = !editorEnabled;
  const dirty = editorEnabled && patternDocument && hasManualEdits(patternDocument);
  const canReset =
    editorEnabled &&
    patternDocument &&
    (hasManualEdits(patternDocument) ||
      patternDocument.meta.editState === "applied");
  if (applyBtn instanceof HTMLButtonElement) {
    applyBtn.hidden = !editorEnabled;
    applyBtn.disabled = !dirty;
  }
  if (resetBtn instanceof HTMLButtonElement) {
    resetBtn.hidden = !editorEnabled;
    resetBtn.disabled = !canReset;
  }
}

function updateUndoButtons(): void {
  const toolbarEl = document.getElementById("editor-toolbar");
  if (!toolbarEl || !canvasController) return;
  const undoBtn = toolbarEl.querySelector('[data-tool="undo"]');
  const redoBtn = toolbarEl.querySelector('[data-tool="redo"]');
  if (undoBtn instanceof HTMLButtonElement) {
    undoBtn.disabled = !canvasController.undoStack.canUndo();
  }
  if (redoBtn instanceof HTMLButtonElement) {
    redoBtn.disabled = !canvasController.undoStack.canRedo();
  }
  syncEditorChrome();
}

function setActiveToolButton(toolId: string): void {
  canvasController?.setActiveTool(toolId);
  const toolbarEl = document.getElementById("editor-toolbar");
  if (!toolbarEl) return;
  for (const b of toolbarEl.querySelectorAll<HTMLButtonElement>("[data-tool]")) {
    if (b.dataset.tool === "undo" || b.dataset.tool === "redo") continue;
    b.classList.toggle("is-active", b.dataset.tool === toolId);
  }
}

function syncDocumentFromCanvas(): PatternDocument | null {
  patternDocument = canvasController?.getDocument() ?? patternDocument;
  return patternDocument;
}

export function applyEditorEdits(): void {
  const doc = syncDocumentFromCanvas();
  if (!doc || !hasManualEdits(doc)) return;
  applyManualEdits(doc);
  canvasController?.undoStack.clear();
  canvasController?.setDocument(doc);
  syncEditorChrome();
}

export function resetEditorEdits(
  draft: DraftResult,
  options: RenderOptions,
  previewEl: HTMLDivElement,
  onDocumentUpdate: (doc: PatternDocument | null) => void
): void {
  if (!editorEnabled) return;
  mountEditorCanvas(draft, options, previewEl, onDocumentUpdate, true);
}

export function mountEditorCanvas(
  draft: DraftResult,
  options: RenderOptions,
  previewEl: HTMLDivElement,
  onDocumentUpdate: (doc: PatternDocument | null) => void,
  forceReset = false
): void {
  if (!editorEnabled) return;
  const opts = {
    productId: draft.productId,
    seamAllowanceCm: options.seamAllowanceCm ?? 1,
    pxPerCm: options.pxPerCm,
  };
  const preserve =
    !forceReset &&
    patternDocument &&
    shouldPreserveEditorDocument(patternDocument);

  if (preserve && patternDocument) {
    patternDocument.meta.productId = draft.productId;
    patternDocument.meta.seamAllowanceCm = opts.seamAllowanceCm;
    patternDocument.meta.pxPerCm = opts.pxPerCm;
  } else {
    patternDocument = fromDraft(draft, opts);
    canvasController?.undoStack.clear();
  }

  if (!canvasController) {
    canvasController = new CanvasController(previewEl);
    canvasController.setOnChange(() => {
      patternDocument = canvasController?.getDocument() ?? null;
      onDocumentUpdate(patternDocument);
      updateUndoButtons();
    });
    canvasController.mount();
  }
  canvasController.setDocument(patternDocument);
  onDocumentUpdate(patternDocument);
  updateUndoButtons();
}

export function unmountEditorCanvas(): void {
  canvasController?.unmount();
  canvasController = null;
  syncEditorChrome();
}

export function renderEditorPreview(): string | null {
  if (!editorEnabled || !patternDocument) return null;
  return renderDocumentToSvg(patternDocument, {
    seamAllowanceCm: patternDocument.meta.seamAllowanceCm,
    pxPerCm: patternDocument.meta.pxPerCm,
  });
}

export function pendingRegenerate(action: () => void, revert?: () => void): void {
  if (!editorEnabled || !patternDocument || !hasManualEdits(patternDocument)) {
    action();
    return;
  }
  pendingRegenerateAction = () => {
    action();
  };
  const dialog = document.getElementById("editor-regenerate-dialog");
  if (dialog instanceof HTMLDialogElement) {
    if (revert) {
      const cancelHandler = () => {
        revert();
        window.removeEventListener("remodellista-regenerate-cancel", cancelHandler);
      };
      window.addEventListener("remodellista-regenerate-cancel", cancelHandler);
    }
    dialog.showModal();
  } else {
    const run = pendingRegenerateAction;
    pendingRegenerateAction = null;
    run?.();
  }
}

export function initEditor(
  getLastDraft: () => DraftResult | null,
  renderOptions: () => RenderOptions,
  onDocumentUpdate: (doc: PatternDocument | null) => void
): void {
  const toggle = document.getElementById("editor-mode-toggle");
  const previewEl = document.getElementById("preview");
  const dialog = document.getElementById("editor-regenerate-dialog");
  const applyBtn = document.getElementById("editor-apply-edits");
  const resetBtn = document.getElementById("editor-reset-edits");

  if (!(toggle instanceof HTMLInputElement)) {
    throw new Error("missing #editor-mode-toggle");
  }
  if (!(previewEl instanceof HTMLDivElement)) {
    throw new Error("missing #preview");
  }

  editorEnabled = false;
  toggle.checked = false;
  patternDocument = null;
  syncEditorChrome();

  toggle.addEventListener("change", () => {
    editorEnabled = toggle.checked;
    saveEditorModePreference(editorEnabled);
    if (!editorEnabled) {
      unmountEditorCanvas();
      patternDocument = null;
      onDocumentUpdate(null);
    }
    syncEditorChrome();
    window.dispatchEvent(new CustomEvent("remodellista-rerender"));
  });

  const toolbar = document.getElementById("editor-toolbar");
  if (toolbar) {
    toolbar.addEventListener("click", (e) => {
      const btn = (e.target as HTMLElement).closest("[data-tool]");
      if (!(btn instanceof HTMLButtonElement)) return;
      const tool = btn.dataset.tool;
      if (!tool) return;
      if (tool === "undo") {
        canvasController?.undo();
        patternDocument = canvasController?.getDocument() ?? patternDocument;
        onDocumentUpdate(patternDocument);
        updateUndoButtons();
        return;
      }
      if (tool === "redo") {
        canvasController?.redo();
        patternDocument = canvasController?.getDocument() ?? patternDocument;
        onDocumentUpdate(patternDocument);
        updateUndoButtons();
        return;
      }
      if (tool === "zoom-in") {
        canvasController?.zoomIn();
        return;
      }
      if (tool === "zoom-out") {
        canvasController?.zoomOut();
        return;
      }
      if (tool === "zoom-fit") {
        canvasController?.fit();
        return;
      }
      setActiveToolButton(tool);
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      applyEditorEdits();
      onDocumentUpdate(patternDocument);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const draft = getLastDraft();
      if (!draft) return;
      resetEditorEdits(draft, renderOptions(), previewEl, onDocumentUpdate);
    });
  }

  const cancelBtn = document.getElementById("editor-regenerate-cancel");
  const confirmBtn = document.getElementById("editor-regenerate-confirm");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      if (dialog instanceof HTMLDialogElement) dialog.close();
      pendingRegenerateAction = null;
      window.dispatchEvent(new CustomEvent("remodellista-regenerate-cancel"));
    });
  }
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (dialog instanceof HTMLDialogElement) dialog.close();
      const action = pendingRegenerateAction;
      pendingRegenerateAction = null;
      patternDocument = null;
      action?.();
    });
  }

  window.addEventListener("keydown", (e) => {
    if (!editorEnabled || isInputFocused()) return;
    if (e.key === "v" || e.key === "V") setActiveToolButton("select");
    else if (e.key === "h" || e.key === "H") setActiveToolButton("pan");
    else if (e.key === "n" || e.key === "N") setActiveToolButton("add-node");
    else if ((e.metaKey || e.ctrlKey) && e.key === "z") {
      e.preventDefault();
      if (e.shiftKey) canvasController?.redo();
      else canvasController?.undo();
      patternDocument = canvasController?.getDocument() ?? patternDocument;
      onDocumentUpdate(patternDocument);
      updateUndoButtons();
    }
  });
}
