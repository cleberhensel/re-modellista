# TASK — Layout e PDF por composição activa

**Prioridade:** P1  
**Onda:** transversal (após Onda 0)  
**Depende de:** [TASK-composicao-motor.md](TASK-composicao-motor.md)

---

## Objetivo

Preview SVG, `layoutPieces` e `exportDraftToPdf` usam **apenas** `PatternPiece` presentes no `DraftResult` após composição — ordem definida pela receita, não lista fixa.

---

## Alterações

| Ficheiro | Acção |
|----------|-------|
| `render/layout.ts` | `PIECE_LAYOUT_ORDER` por receita ou `meta.activePieceIds` |
| `render/pdf.ts` | Uma página por peça activa (já parcialmente assim) |
| `render/svg.ts` | Labels só para peças presentes |
| `engine/composition/compose.ts` | `meta.activeSlots` no `DraftResult` |

---

## Ordem de layout por família

| Família | Ordem |
|---------|-------|
| Bodice | frente, costas |
| Complementos | manga, colarinho×2, punho, carcela, bolsos |
| Saia | frente, costas |
| Calça | frente, costas, cós |

---

## Critérios de aceite

- [ ] Blusa só corpo → PDF 2 páginas
- [ ] Camisa full → 8 páginas
- [ ] Camisa sem bolso → 7 páginas
- [ ] `bounds` reflecte só peças activas
- [ ] Testes layout não assumem 3 peças para camisa
