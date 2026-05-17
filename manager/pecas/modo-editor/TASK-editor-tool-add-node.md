# TASK — Ferramenta Adicionar nó

**Prioridade:** P0  
**Onda:** 2  
**Depende de:** [TASK-editor-canvas-mount.md](TASK-editor-canvas-mount.md), [TASK-editor-undo-redo.md](TASK-editor-undo-redo.md)  
**Bloqueia:** —

---

## Objetivo

Inserir um vértice numa **aresta** do contorno (`cut` ou `fold`) sem quebrar a topologia.

---

## Interacção

1. Activar tool **+ Nó** na toolbar.
2. Hover em aresta: highlight da aresta.
3. Clique: projectar ponto na aresta mais próxima → `insertNodeOnEdge(doc, pieceId, pathId, edgeIndex, t)`.
4. `pushUndo` antes da inserção.

---

## Cálculo de `t`

- Aresta entre `nodes[i]` e `nodes[i+1]` (ou wrap se `closed`).
- Para segmento `line`: projeção paramétrica.
- Para `cubic`: resolver em parâmetro da Bézier (Newton ou subdivisão); MVP se só `line`: projeção linear.

Rejeitar se `t < 0,05` ou `t > 0,95` (muito perto de vértice existente).

---

## segmentKinds

- Inserir nó divide aresta `line` em duas `line`.
- Se aresta era `cubic`, dividir em duas cubics (de Casteljau) — se MVP só lines, converter cubic antes.

---

## Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `editor/document.ts` | `insertNodeOnEdge` |
| `editor/tools/add-node.ts` | tool |
| `editor/canvas/hit-test.ts` | `pickEdge` |

---

## Critérios de aceite

- [ ] Novo nó aparece no ponto clicado na aresta
- [ ] Contorno permanece fechado se era fechado
- [ ] Undo remove o nó inserido
- [ ] Teste unitário: inserir no meio de aresta 10 cm → dois segmentos ~5 cm
