# TASK — Ferramenta Remover nó

**Prioridade:** P0  
**Onda:** 2  
**Depende de:** [TASK-editor-tool-select.md](TASK-editor-tool-select.md), [TASK-editor-undo-redo.md](TASK-editor-undo-redo.md)  
**Bloqueia:** —

---

## Objetivo

Apagar vértice seleccionado do path, mantendo polígono válido.

---

## Interacção

| Acção | Comportamento |
|-------|----------------|
| Toolbar **− Nó** | se `selection.kind === 'node'`, `removeNode`; senão noop |
| Tecla Delete / Backspace | mesmo, com nó seleccionado |
| Clique em nó com tool activa | remove directamente |

---

## Validação

| Condição | Resultado |
|----------|-----------|
| Path fechado, `nodes.length <= 3` após remove | bloquear + toast/aria-live "Mínimo 3 pontos" |
| Path aberto, `nodes.length <= 2` | bloquear |
| Único nó de path guia | permitir remover path inteiro (P2) — MVP: bloquear |

Após remove: merge duas arestas adjacentes; actualizar `segmentKinds`.

---

## Selecção pós-delete

- Selecionar nó anterior na ordem do path, ou `none` se falhou.

---

## Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `editor/document.ts` | `removeNode` |
| `editor/tools/delete-node.ts` | tool + shortcut |
| `app.ts` | listener keydown só se `editorEnabled` e foco não em input |

---

## Critérios de aceite

- [ ] Não é possível apagar abaixo de 3 vértices em contorno fechado
- [ ] Undo restaura nó e topologia
- [ ] Teste: pentágono → remover 1 → quadrilátero válido
