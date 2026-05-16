# TASK — Produto completo configurável: Malha

**Product ID:** `malha`  
**Prioridade:** P1  
**Onda:** 1  
**Depende de:** [TASK-blusa-completa.md](TASK-blusa-completa.md)  
**Ficha:** [../malha-knit.md](../malha-knit.md)

---

## Objetivo

Malha = bodice com perfil tecido (`suppressDarts`, redução %) + **manga opcional** (muitas malhas têm manga raglan — fora de escopo; usar set-in simplificado).

---

## Composição

| Slot | Default |
|------|---------|
| Bodice | ON (`fabricProfileId: knit-light`) |
| Manga | OFF (opcional ON) |
| Colarinho | OFF |
| Punho | OFF |
| `suppressDarts` | true quando perfil knit |

---

## Opções

- Select perfil: `knit-light` / `knit-strong` (existente).
- Toggle manga: se ON, `draftSleevePiece` com ease reduzido (documentar factor).

---

## Critérios de aceite

- [ ] Default: 2 peças sem pences no contorno
- [ ] Com manga: 3 peças; cabeça compatível com cava
- [ ] Medidas ajustadas por `applyFabricProfile`
- [ ] UI mostra só toggles relevantes para malha
