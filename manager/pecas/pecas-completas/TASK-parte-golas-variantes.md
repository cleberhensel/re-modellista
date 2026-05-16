# TASK — Parte: variantes de gola (fase 2)

**Part slot:** `collar` (enum)  
**Prioridade:** P3  
**Depende de:** [TASK-blusa-completa.md](TASK-blusa-completa.md)  
**Ficha:** [../complementares.md](../complementares.md)

---

## Objetivo

Além do colarinho camisa (stand + fall), suportar tipos:

| Tipo | `collarType` | Peças |
|------|--------------|-------|
| Nenhuma | `none` | — |
| Camisa clássica | `shirt` | stand + fall (actual) |
| Peter Pan | `peterPan` | arco único |
| Militar | `military` | faixa + ponta |
| Polo (fase 3) | `polo` | extensão CF |

---

## Escopo fase 2

- Enum `collarType` em `DraftOptions`
- `draftCollarShirt` = código actual
- Stubs ou implementação mínima Peter Pan

---

## Critérios de aceite

- [ ] `collarType: none` não gera colarinho
- [ ] `shirt` = regressão actual
- [ ] UI select tipo de gola quando `includeCollar` ON
- [ ] Documentar fora de escopo: gola alta, lapela
