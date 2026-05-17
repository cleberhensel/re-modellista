# TASK — Ferramenta Seleccionar

**Prioridade:** P0  
**Onda:** 2  
**Depende de:** [TASK-editor-canvas-mount.md](TASK-editor-canvas-mount.md)  
**Bloqueia:** [TASK-editor-tool-move.md](TASK-editor-tool-move.md)

---

## Objetivo

Seleccionar **peça**, **aresta** ou **nó** para edição posterior; feedback visual claro.

---

## Modelo de seleção (`editor/selection.ts`)

```ts
type Selection =
  | { kind: 'none' }
  | { kind: 'piece'; pieceId: string }
  | { kind: 'edge'; pieceId: string; pathId: string; edgeIndex: number }
  | { kind: 'node'; pieceId: string; pathId: string; nodeId: string };
```

Estado vive no `CanvasController` (não no documento).

---

## Interacção

| Clique | Resultado |
|--------|-----------|
| Nó (hit) | `selection = node` |
| Aresta (hit, sem nó) | `selection = edge` |
| Interior da peça | `selection = piece` |
| Vazio | `selection = none` |
| Shift + clique nó | multi-select nós (opcional MVP: **só um nó** no MVP) |

Duplo-clique na peça: fit peça (nice-to-have).

---

## Feedback visual

| Selecção | Estilo |
|----------|--------|
| Nó | círculo 6px, fill brand, stroke branco |
| Aresta | segmento highlight `--color-brand` 2px |
| Peça | bbox tracejado leve |

---

## Teclado

| Tecla | Acção |
|-------|--------|
| Escape | limpar seleção |
| Tab | ciclar nós do path activo (opcional P1) |

---

## Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `editor/selection.ts` | tipos + helpers |
| `editor/tools/select.ts` | `SelectTool` implements `EditorTool` |
| `editor/canvas/render.ts` | layer handles conforme selection |

---

## Interface `EditorTool`

```ts
interface EditorTool {
  id: string;
  onActivate(ctx: ToolContext): void;
  onDeactivate(ctx: ToolContext): void;
  onPointerDown(e: PointerEvent, ctx: ToolContext): void;
  onPointerMove(e: PointerEvent, ctx: ToolContext): void;
  onPointerUp(e: PointerEvent, ctx: ToolContext): void;
}
```

---

## Critérios de aceite

- [ ] Clicar nó da frente selecciona e mostra handle
- [ ] Clicar fora limpa seleção
- [ ] Ferramenta activa por defeito ao abrir editor
- [ ] Teste hit-test + select com coordenadas mock
