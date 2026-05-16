# TASK — Parte: bolso lateral (jaqueta)

**Part slot:** `sidePocket`  
**PatternPiece.id:** `side-pocket`  
**Prioridade:** P2  
**Onda:** 2  
**Depende de:** [TASK-composicao-motor.md](TASK-composicao-motor.md)  
**Ficha:** [../complementares.md](../complementares.md) (estender)

---

## Objetivo

Bolso aplicado na lateral do corpo — típico de jaquetas/casacos; distinto do bolso peito (`chest-pocket`).

---

## Geometria alvo (MVP)

```
Retângulo patch + aba
Largura ~12–14 cm × altura ~14–16 cm (escala k)
Ancoragem: offset do ombro e da lateral frente (points no bodice)
```

---

## Implementação

| Ficheiro | Acção |
|----------|-------|
| `engine/pieces/side-pocket.ts` | `draftSidePocket(ctx, anchor)` |
| `engine/composition/drafters.ts` | Slot `sidePocket` |
| `render/svg.ts` | Label “Bolso lateral” |

Ancoragem: reutilizar `blouse-front.points` ou marcar `sidePocketAnchor` no bodice.

---

## Critérios de aceite

- [ ] Peça isolada em `kind: part` para debug (`bolso-lateral` opcional no catálogo)
- [ ] Incluída quando `includeSidePocket` e preset jaqueta
- [ ] Não incluída em camisa/blusa por defeito
- [ ] Teste: peça tem `paths.length > 0`
