# TASK — Vestido completo configurável

**Product ID:** `vestido`  
**Prioridade:** P2  
**Onda:** 4  
**Depende de:** [TASK-blusa-completa.md](TASK-blusa-completa.md), [TASK-saia-completa.md](TASK-saia-completa.md)  
**Ficha:** [../vestido.md](../vestido.md)

---

## Objetivo

Vestido = **receita composta**: bodice (com opções de blusa) + saia + manga opcional; cintura alinhada (`resolveWaistMismatch`).

---

## Composição

| Bloco | Slots herdados |
|-------|----------------|
| Bodice | De `blusa`: bodice, sleeve?, collar?, chestPocket? |
| Skirt | `skirt-front`, `skirt-back` |
| Waistband | OFF (junção natural na cintura; cós separado fase 2) |

---

## UI

- Secção composição: mesmas toggles que blusa para parte superior + “Manga” para vestido com manga.
- Medidas: `bodiceLength`, `skirtLength`, hip, bust, waist.

---

## Layout

- Grelha 2×2: bodice em cima, saia em baixo (existente); alinhar cintura visual.

---

## Estado actual

- 4 peças fixas; sem manga; sem toggles.

---

## Critérios de aceite

- [ ] Default: 4 peças (frente/costas + saia frente/costas)
- [ ] Com manga: +1 peça; perímetro cava ok
- [ ] `resolveWaistMismatch` antes de compor
- [ ] Toggles superiores reflectidos no vestido
