# TASK — Produto completo configurável: Camisa

**Product ID:** `camisa`  
**Prioridade:** P1  
**Onda:** 1  
**Depende de:** [TASK-blusa-completa.md](TASK-blusa-completa.md)  
**Ficha:** [../camisa.md](../camisa.md)

---

## Objetivo

`camisa` = **preset** sobre receita blusa: defaults com todos os complementos de camisa clássica, mas cada um desligável no UI.

---

## Composição default (preset camisa)

| Slot | Default |
|------|---------|
| Bodice | ON |
| Manga | ON (longa) |
| Colarinho | ON |
| Punho | ON |
| Carcela | ON |
| Bolso peito | ON |

---

## Diferença vs `blusa`

- `includePlacket` default **true** (único produto com carcela por defeito).
- `compositionFields` inclui todos os slots superiores.
- Label UI: “Camisa” mantém-se; utilizador pode desligar bolso para camisa lisa.

---

## Estado actual

- `draftShirt` hardcoda 8 peças sempre.

---

## Critérios de aceite

- [ ] Preset = comportamento actual (8 peças)
- [ ] Desligar bolso → 7 peças no PDF
- [ ] Desligar colarinho → sem `collar-*`; guardrail NC opcional
- [ ] Regressão `golden.test` camisa 8 peças com defaults
