# TASK — Ferramenta Mover peça (V2.1)

**Prioridade:** P1  
**Onda:** 5  
**Depende de:** [TASK-editor-tool-select.md](TASK-editor-tool-select.md), [TASK-editor-undo-redo.md](TASK-editor-undo-redo.md)  
**Bloqueia:** —

---

## Objetivo

Deslocar **toda a peça** no tabuleiro (`EditablePiece.layout.x/y`) sem alterar geometria local — reorganizar folha de molde.

---

## Interacção

1. Seleccionar peça (clique no interior ou bbox).
2. Tool **Mover peça** ou drag do bbox com Alt.
3. `pointermove`: `layout.x += dx`, `layout.y += dy` (delta mundo).
4. `pointerup`: undo entry.

---

## Colisões (P2)

MVP: sem snap entre peças; opcional grelha de layout 1 cm.

---

## Export / layout

`render/layout.ts` deve usar `layout` do documento em vez de só auto-layout quando `layoutManual: true` flag na peça.

---

## Critérios de aceite

- [ ] Manga e frente podem ser afastadas no canvas
- [ ] PDF reflecte novas posições
- [ ] Undo restaura posição
- [ ] Não incrementa alteração de contorno (só layout)
