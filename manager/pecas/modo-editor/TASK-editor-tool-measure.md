# TASK — Ferramenta Medir (V2.1)

**Prioridade:** P1  
**Onda:** 5  
**Depende de:** [TASK-editor-pan-zoom.md](TASK-editor-pan-zoom.md)  
**Bloqueia:** —

---

## Objetivo

Medir **distância em linha recta** ou **comprimento ao longo de aresta** entre dois pontos, em cm, sem alterar o documento.

---

## Modos

| Modo | Descrição |
|------|-----------|
| Livre | dois cliques → distância euclidiana |
| Ao longo da aresta | snap aresta → comprimento do arco (line ou cubic) |

---

## UI

- Linha temporária tracejada + label flutuante `12,4 cm`
- Não entra no undo stack
- Escape cancela medição activa

---

## Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `editor/tools/measure.ts` | tool |
| `editor/geometry/arc-length.ts` | comprimento cubic (reutilizar `pathLength` se existir) |

---

## Critérios de aceite

- [ ] Medir diagonal de bbox da frente ≈ valor esperado ± 0,1 cm
- [ ] Medir aresta recta 10 cm → label 10,0 cm
- [ ] Tool não altera `manualEditRevision`
