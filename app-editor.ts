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

let patternDocument: PatternDocument | null = null;
let canvasController: CanvasController | null = null;
let pendingRegenerateAction: (() => void) | null = null;
let seamPreviewMode = false;

export function isEditorEnabled(): boolean {
  return true;
}

export function isMoldFullscreen(): boolean {
  return true;
}

export function isSeamPreviewMode(): boolean {
  return seamPreviewMode;
}

export function setSeamPreviewMode(enabled: boolean): void {
  if (seamPreviewMode === enabled) return;
  seamPreviewMode = enabled;
  canvasController?.setSeamPreviewMode(enabled);
  document.body.classList.toggle("seam-preview-mode", enabled);
  syncEditorChrome();
  if (!enabled) {
    setActiveToolButton("pan");
  }
}

function updateAppHeaderOffset(): void {
  const header = document.querySelector(".app-header");
  if (header instanceof HTMLElement) {
    document.documentElement.style.setProperty(
      "--app-header-offset",
      `${header.offsetHeight}px`
    );
  }
}

export function getPatternDocument(): PatternDocument | null {
  return patternDocument;
}

export function hasSavedPatternView(doc: PatternDocument | null = patternDocument): boolean {
  return doc !== null && doc.meta.editState !== "draft";
}

export function clearSavedPatternView(): void {
  patternDocument = null;
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement
  );
}

export function syncEditorChrome(): void {
  const resetBtn = document.getElementById("editor-reset-edits");
  const previewBtn = document.getElementById("editor-seam-preview-toggle");
  const toolbar = document.getElementById("editor-toolbar");
  const canReset =
    patternDocument &&
    (hasManualEdits(patternDocument) ||
      patternDocument.meta.editState === "applied");
  if (resetBtn instanceof HTMLButtonElement) {
    resetBtn.disabled = seamPreviewMode || !canReset;
  }
  if (previewBtn instanceof HTMLButtonElement) {
    previewBtn.classList.toggle("is-active", seamPreviewMode);
    previewBtn.setAttribute("aria-pressed", seamPreviewMode ? "true" : "false");
  }
  if (toolbar) {
    const editOnlyTools = ["select", "undo", "redo"];
    for (const toolId of editOnlyTools) {
      const btn = toolbar.querySelector(`[data-tool="${toolId}"]`);
      if (btn instanceof HTMLButtonElement) {
        btn.disabled = seamPreviewMode;
      }
    }
  }
  const previewEl = document.getElementById("preview");
  if (previewEl) {
    previewEl.classList.toggle("seam-preview-mode", seamPreviewMode);
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

function syncToolbarActiveTool(toolId: string): void {
  const toolbarEl = document.getElementById("editor-toolbar");
  if (!toolbarEl) return;
  for (const b of toolbarEl.querySelectorAll<HTMLButtonElement>("[data-tool]")) {
    const t = b.dataset.tool;
    if (!t || t === "undo" || t === "redo" || t === "seam-preview") continue;
    b.classList.toggle("is-active", t === toolId);
  }
}

function setActiveToolButton(toolId: string): void {
  if (seamPreviewMode && toolId !== "pan") return;
  canvasController?.setActiveTool(toolId);
  syncToolbarActiveTool(toolId);
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
  clearSavedPatternView();
  mountEditorCanvas(draft, options, previewEl, onDocumentUpdate, true);
}

export function mountEditorCanvas(
  draft: DraftResult,
  options: RenderOptions,
  previewEl: HTMLDivElement,
  onDocumentUpdate: (doc: PatternDocument | null) => void,
  forceReset = false,
  regenerateKey?: string
): void {
  const opts = {
    productId: draft.productId,
    seamAllowanceCm: options.seamAllowanceCm ?? 1,
    pxPerCm: options.pxPerCm,
    regenerateKey,
  };
  const keyMatches =
    !regenerateKey ||
    patternDocument?.meta.regenerateKey === regenerateKey;
  const preserve =
    !forceReset &&
    patternDocument &&
    shouldPreserveEditorDocument(patternDocument) &&
    keyMatches;

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
    canvasController.setOnToolChange(syncToolbarActiveTool);
    canvasController.mount();
    if (seamPreviewMode) {
      canvasController.setSeamPreviewMode(true);
    }
  }
  canvasController.setDocument(patternDocument);
  if (!seamPreviewMode) {
    syncToolbarActiveTool(canvasController.getActiveToolId());
  }
  onDocumentUpdate(patternDocument);
  updateUndoButtons();
}

export function unmountEditorCanvas(): void {
  canvasController?.unmount();
  canvasController = null;
  syncEditorChrome();
}

export function shouldConfirmRegenerate(): boolean {
  if (!patternDocument) return false;
  return (
    hasManualEdits(patternDocument) || hasSavedPatternView(patternDocument)
  );
}

function setRegenerateDialogOpen(open: boolean): void {
  document.body.classList.toggle("editor-dialog-open", open);
}

function bindRegenerateDialog(dialog: HTMLDialogElement): void {
  dialog.addEventListener("close", () => {
    setRegenerateDialogOpen(false);
  });
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    pendingRegenerateAction = null;
    window.dispatchEvent(new CustomEvent("remodellista-regenerate-cancel"));
    dialog.close();
  });
}

export function pendingRegenerate(action: () => void, revert?: () => void): void {
  if (!shouldConfirmRegenerate()) {
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
    setRegenerateDialogOpen(true);
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
  const previewEl = document.getElementById("preview");
  const dialog = document.getElementById("editor-regenerate-dialog");
  const resetBtn = document.getElementById("editor-reset-edits");

  if (!(previewEl instanceof HTMLDivElement)) {
    throw new Error("missing #preview");
  }

  if (dialog instanceof HTMLDialogElement) {
    bindRegenerateDialog(dialog);
  }

  patternDocument = null;
  document.body.classList.add("mold-fullscreen");
  updateAppHeaderOffset();
  syncEditorChrome();

  window.addEventListener("resize", updateAppHeaderOffset);

  const toolbar = document.getElementById("editor-toolbar");
  if (toolbar) {
    toolbar.addEventListener("click", (e) => {
      const btn = (e.target as HTMLElement).closest("[data-tool]");
      if (!(btn instanceof HTMLButtonElement)) return;
      const tool = btn.dataset.tool;
      if (!tool) return;
      if (tool === "seam-preview") {
        setSeamPreviewMode(!seamPreviewMode);
        return;
      }
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
      clearSavedPatternView();
      action?.();
    });
  }

  window.addEventListener("keydown", (e) => {
    if (isInputFocused()) return;
    if (e.key === "p" || e.key === "P") {
      if (!(e.metaKey || e.ctrlKey || e.altKey)) {
        e.preventDefault();
        setSeamPreviewMode(!seamPreviewMode);
      }
      return;
    }
    if (seamPreviewMode) return;
    if (e.key === "v" || e.key === "V") setActiveToolButton("select");
    else if (e.key === "h" || e.key === "H") setActiveToolButton("pan");
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
