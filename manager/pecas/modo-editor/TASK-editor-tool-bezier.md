# TASK — Ferramenta Bézier (V2.1)

**Prioridade:** P1  
**Onda:** 5  
**Depende de:** [TASK-editor-tool-select.md](TASK-editor-tool-select.md), [TASK-editor-draft-adapter.md](TASK-editor-draft-adapter.md)  
**Bloqueia:** —

---

## Objetivo

Editar segmentos **cúbicos** com handles `handleIn` / `handleOut`; converter aresta recta em curva e vice-versa.

---

## Interacção

| Acção | Comportamento |
|-------|----------------|
| Seleccionar nó com handles | mostrar linhas handle + grips |
| Arrastar handle | actualiza curva; `segmentKinds[i] = 'cubic'` |
| Alt+clique aresta (line) | converter para cubic com handles default (1/3 do chord) |
| Menu contextual "Rectificar" | cubic → line (colapsar handles) |

---

## Adapter

Garantir [TASK-editor-draft-adapter.md](TASK-editor-draft-adapter.md) preserva `cubic` do motor sem discretizar.

---

## Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `editor/tools/bezier.ts` | tool |
| `editor/document.ts` | `setNodeHandles`, `convertEdgeToCubic` |
| `editor/canvas/render.ts` | desenho handles |

---

## Critérios de aceite

- [ ] Manga/cava mantém forma suave após editar handle
- [ ] Undo restaura handles
- [ ] Export SVG usa `C` commands correctos
