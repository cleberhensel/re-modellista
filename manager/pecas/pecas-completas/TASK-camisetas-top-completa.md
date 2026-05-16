# TASK — Camiseta e tops configuráveis

**Product IDs:** `top-sem-mangas`, preset **camiseta** em `blusa`  
**Prioridade:** P1  
**Onda:** 1  
**Depende de:** [TASK-blusa-completa.md](TASK-blusa-completa.md)

---

## Objetivo

Separar claramente **camiseta** (manga curta, sem colarinho, sem carcela) de **top sem mangas** (cava profunda).

---

## Preset camiseta (sugestão: `blusa` + preset UI)

| Slot | Valor |
|------|-------|
| Bodice | ON |
| Manga | ON |
| `sleevePreset` | `short` (ou `sleeveLength` ≤ 25 cm) |
| Colarinho | OFF |
| Punho | OFF (ou ON opcional — decidir) |
| Carcela | OFF |
| Bolso peito | OFF (opcional ON) |

---

## `top-sem-mangas`

| Slot | Valor |
|------|-------|
| Bodice | ON |
| Manga | OFF (`sleeveless: true`) |
| `armholeDepthOffsetCm` | 2–3 cm (existente) |
| Colarinho | OFF |

Receita trava `includeSleeve: false` em `lockedSlots`.

---

## Produto novo? (opcional)

- `camiseta` como `productId` separado no catálogo = mesmo motor, `compositionDefaults` do preset.
- Evita confundir “blusa” com “camiseta” no seletor.

---

## Critérios de aceite

- [ ] Preset camiseta: 3 peças típicas (frente, costas, manga)
- [ ] `top-sem-mangas`: 2 peças; cava > blusa com manga nas mesmas medidas
- [ ] UI preset “Camiseta” um clique
- [ ] Teste integração `pathLength` cava sleeveless
