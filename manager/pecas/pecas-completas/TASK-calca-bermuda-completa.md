# TASK — Calça e bermuda configuráveis

**Product IDs:** `calca`, `bermuda`  
**Prioridade:** P2  
**Onda:** 3  
**Depende de:** [TASK-composicao-motor.md](TASK-composicao-motor.md)  
**Ficha:** [../calca.md](../calca.md)

---

## Objetivo

Pernas + **cós** opcional + bolsos opcionais (fase 2); bermuda = mesma receita com `legLengthCm` fixo.

---

## Composição

| Slot | calça | bermuda |
|------|-------|---------|
| Pant | ON | ON |
| Waistband | OFF (opcional) | OFF (opcional) |
| Front pocket | OFF fase 2 | OFF fase 2 |
| Back pocket | OFF fase 2 | OFF fase 2 |

---

## Receita partilhada

- `recipeId: 'pant-base'`
- `bermuda` → `compositionDefaults: { legLengthCm: 45 }`
- UI: produto bermuda esconde opções irrelevantes (manga, colarinho)

---

## Estado actual

- Só `pant-front` + `pant-back`.
- `bermuda` produto separado sem composição.

---

## Critérios de aceite

- [ ] Toggle cós calça/bermuda
- [ ] Bermuda PDF altura de perna coerente com `legLengthCm`
- [ ] Guardrails perímetro gancho mantidos
- [ ] Documentar fly/braguilha como fase 3
