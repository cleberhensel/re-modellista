# TASK — Desfazer / Refazer

**Prioridade:** P0  
**Onda:** 2  
**Depende de:** [TASK-editor-document-model.md](TASK-editor-document-model.md)  
**Bloqueia:** [TASK-editor-tool-move.md](TASK-editor-tool-move.md)

---

## Objetivo

Stack de histórico sobre **snapshots** de `PatternDocument` para todas as mutações do editor.

---

## API (`editor/undo.ts`)

```ts
class UndoStack {
  push(before: PatternDocument): void;
  undo(current: PatternDocument): PatternDocument | null;
  redo(current: PatternDocument): PatternDocument | null;
  canUndo(): boolean;
  canRedo(): boolean;
  clear(): void;
}
```

- `push` guarda clone **antes** da operação (ou depois — documentar uma convenção; recomendado: **before**).
- Máximo 50 entradas; descartar redo branch ao novo `push`.

---

## Operações que entram no stack

| Operação | push |
|----------|------|
| moveNode (pointerup) | sim |
| insertNode | sim |
| removeNode | sim |
| fromDraft / regenerate | **clear** stack |
| undo/redo | não |

---

## UI

- Toolbar: botões Desfazer / Refazer, `disabled` quando stack vazio
- Atalhos: `Ctrl+Z` / `Ctrl+Shift+Z` (Mac: `Meta`)

---

## Integração `app.ts`

```ts
canvasController.undoStack = undoStack;
onDocumentChange(doc) { patternDocument = doc; canvas.setDocument(doc); updateUndoButtons(); }
```

---

## Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `editor/undo.ts` | implementação |
| `editor/undo.test.ts` | push/undo/redo/limit |
| `TASK-editor-toolbar.md` | botões |

---

## Critérios de aceite

- [ ] Mover nó duas vezes → undo uma vez volta à posição intermédia
- [ ] Redo reaplica segunda posição
- [ ] Regenerar draft limpa histórico
- [ ] `manualEditRevision` recalculado ou preservado conforme snapshot (clonar revision no doc)

---

## Nota

Não usar diff por nó no MVP; clone completo é suficiente (< 50 peças × ~100 nós).
