# TASK — Saia reta configurável

**Product ID:** `saia-reta`  
**Prioridade:** P2  
**Onda:** 3  
**Depende de:** [TASK-composicao-motor.md](TASK-composicao-motor.md)  
**Ficha:** [../saia-reta.md](../saia-reta.md)

---

## Objetivo

Saia = frente + costas + **cós opcional** (UI) + fenda traseira opcional (fase 2).

---

## Composição

| Slot | Default |
|------|---------|
| Skirt | ON |
| Waistband | OFF (`includeWaistband` → UI toggle) |
| Vent back | OFF (fase 2) |

---

## Estado actual

- `includeWaistband` em `DraftOptions` sem toggle no UI.
- Sempre 2 peças no resultado.

---

## Critérios de aceite

- [ ] Toggle “Cós” no painel composição
- [ ] 2 ou 3 peças conforme toggle
- [ ] PDF omite cós se OFF
- [ ] Medidas: waist, hip, hipDepth, skirtLength
