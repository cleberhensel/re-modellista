# TASK — Produto completo configurável: Blusa

**Product ID:** `blusa`  
**Prioridade:** P1  
**Onda:** 1  
**Depende de:** [TASK-composicao-motor.md](TASK-composicao-motor.md), [TASK-ui-configurador.md](TASK-ui-configurador.md)  
**Ficha:** [../blusa-frente.md](../blusa-frente.md), [../blusa-costas.md](../blusa-costas.md)

---

## Objetivo

`blusa` = receita configurável do **corpo superior**, base para camisa, camiseta e vestido (bodice).

---

## Composição alvo

| Slot | Default | Notas |
|------|---------|-------|
| Bodice | ON | `blouse-front`, `blouse-back` |
| Manga | OFF | ON → `sleeve`; `sleeveLength` da medida ou preset |
| Colarinho | OFF | `collar-stand`, `collar-fall` |
| Punho | OFF | Só se manga; default OFF até utilizador ligar |
| Carcela | OFF | Não típico em blusa; reservado para derivados |
| Bolso peito | OFF | Opcional |

---

## Variantes cobertas

| Variante | Opções |
|----------|--------|
| Blusa sem manga | defaults |
| Blusa manga curta | `includeSleeve` + `sleevePreset: short` |
| Blusa manga longa | `includeSleeve` + `sleevePreset: long` |
| Blusa com gola | `includeCollar` |
| Blusa com bolso | `includeChestPocket` |

---

## Estado actual

- `draftBlouse` → só bodice; sem slots.

---

## Critérios de aceite

- [ ] Default UI: só frente + costas (2 peças)
- [ ] Com manga + punho: 3–4 peças; cap ease validado
- [ ] Com colarinho: perímetro decote usado em `collar.ts`
- [ ] PDF uma página por peça activa
- [ ] Não regressão golden blusa bodice
