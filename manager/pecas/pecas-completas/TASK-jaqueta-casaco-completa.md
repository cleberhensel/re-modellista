# TASK — Jaqueta e casaco configuráveis

**Product ID:** `casaco` (+ futuro `jaqueta`)  
**Prioridade:** P2  
**Onda:** 2  
**Depende de:** [TASK-blusa-completa.md](TASK-blusa-completa.md), [TASK-parte-bolso-lateral.md](TASK-parte-bolso-lateral.md)  
**Ficha:** [../casaco-blazer.md](../casaco-blazer.md)

---

## Objetivo

Exteriores: corpo com ease, **manga sempre longa** (locked), colarinho opcional, bolso peito e **bolso lateral** opcionais.

---

## Composição

| Slot | Default | Regra |
|------|---------|-------|
| Bodice | ON | `designEaseBust`, `coatLength` |
| Manga | ON | **locked** longa; `sleeveCapScale` |
| Colarinho | OFF | Fase 1 opcional; fase 2 lapela |
| Punho | OFF | Opcional (jaqueta jeans: OFF) |
| Bolso peito | OFF | Opcional |
| Bolso lateral | ON | Preset jaqueta; OFF preset casaco formal |

---

## Presets

| Preset | Descrição |
|--------|-----------|
| Casaco | Ease 6 cm; manga longa; sem bolso lateral |
| Jaqueta | Ease 8–10 cm; manga longa; bolso lateral ON |

---

## Fase 2 (documentar)

- Lapela / sobreposição frente
- Ombro estrutural
- Forro (molde duplicado)

---

## Estado actual

- `draftCoat` → bodice + manga escalada; sem bolsos nem gola.

---

## Critérios de aceite

- [ ] `lockedSlots` impede desligar manga no UI
- [ ] `sleeveLength` ≥ mínimo jaqueta (ex. 58 cm ou % do braço)
- [ ] Com bolso lateral: +1 peça no PDF
- [ ] Meta `designEaseBust` no contexto
