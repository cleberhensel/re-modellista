# TASK — Ferramenta Mover nó

**Prioridade:** P0  
**Onda:** 2  
**Depende de:** [TASK-editor-tool-select.md](TASK-editor-tool-select.md), [TASK-editor-undo-redo.md](TASK-editor-undo-redo.md)  
**Bloqueia:** —

---

## Objetivo

Arrastar nó(s) seleccionado(s) para alterar o contorno; gravar no undo stack.

---

## Fluxo

1. Requer `selection.kind === 'node'` (ou iniciar drag a partir de nó com Select+drag).
2. `pointerdown` no nó: guardar `dragStart` (posição mundo + snapshot doc para undo).
3. `pointermove`: `moveNode(doc, ..., x, y)` + `redraw()`.
4. `pointerup`: `pushUndo(snapshot)` se posição mudou > 0,01 cm.

---

## Ferramenta dedicada vs Select

**MVP:** Select + drag no nó já move (comportamento único).  
Botão toolbar **Mover** (`tool-move`): mesmo código, cursor `move`; impede seleccionar aresta sem nó.

---

## Restrições (opcional P1)

- Snap a grelha 0,1 cm (toggle toolbar)
- Snap a outros nós (guia visual)
- Shift: restringir eixo H ou V

MVP: sem snap.

---

## Handles Bézier (V2.1)

No MVP, mover só `x,y` do nó; handles em TASK bézier.

---

## Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `editor/tools/move.ts` | drag logic |
| `editor/document.ts` | `moveNode` |
| Integração `select.ts` | delegar drag se tool move ou select |

---

## Critérios de aceite

- [ ] Arrastar nó actualiza path no SVG em tempo real
- [ ] Soltar dispara um único undo entry
- [ ] `manualEditRevision` incrementa
- [ ] Teste: mover nó 1 cm altera `pathLength` de forma previsível

---

## Edge cases

- Drag fora do SVG: continuar até `pointerup` global
- Nó em path `fold`: permitir mover (dobra é editável)
