# TASK — Atualizar produto completo: Vestido

**Product ID:** `vestido`  
**Prioridade:** P1  
**Depende de:** [TASK-update-blusa.md](TASK-update-blusa.md), [TASK-update-saia-reta.md](TASK-update-saia-reta.md)  
**Ficha:** [../vestido.md](../vestido.md)

---

## Objetivo

Vestido = **bodice truncado** + **saia** com **cintura alinhada** (4 peças), sem `waist_mismatch` em medidas coerentes; opcional manga em fase 2.

---

## Problemas atuais

- Erro `waist_mismatch` frequente sem auto-ajuste  
- Bodice usa `height` = `bodiceLength` mas saia usa contexto separado  
- Layout 4 peças com ordem que pode sobrepor (blusa 0,1 + saia 2,3)  
- Sem validação Σ pences corpo + saia  

---

## Fórmulas alvo

### Compatibilidade cintura

```
waistQuarterBlouse = floor(waist)/4 * k   // bodice
waistQuarterSkirt  = skirtCtx.waistQuarterPx
|waistQuarterBlouse - waistQuarterSkirt| <= 2*k  // tolerância
```

Se falhar: **auto-resolve** (preferir ajustar saia ±1*k ou mostrar hint UI).

### Aldrich / two-piece dress

```
W_bodice_finished = W_skirt_finished
Alinhar eixos pences na linha de cintura
```

Fonte: [Pattern Lab two-piece dress](https://patternlab.london/home/project/two-piece-dress-pattern-making-tutorial/)

### Medidas

| Campo | Uso |
|-------|-----|
| `bodiceLength` | Altura corpo (substitui `height` no bodice) |
| `skirtLength` | Saia |
| `hip`, `hipDepth` | Saia |
| `bust`, `waist` | Bodice |

---

## Implementação

| Ficheiro | Ação |
|----------|------|
| `engine/products/dress.ts` | `resolveWaistMismatch()`, merge contexts |
| `engine/pieces/*` | Reutilizar blusa/saia corrigidas |
| `render/layout.ts` | Grelha 2×2: frente+costas em cima, saias em baixo, alinhar `offsetY` na cintura |
| `engine/guardrails/dress.ts` | Hint antes de erro hard |

---

## Critérios de aceite

- [ ] Medidas padrão: 4 peças sem erro  
- [ ] Visual: cintura bodice e saia na mesma Y relativa no layout  
- [ ] Teste: `bodiceLength` 42 + `skirtLength` 60 → hem coerente  
- [ ] Fase 2: `dressWithSleeve` adiciona manga (documentar)  

---

## Referências

- [Create & Enjoy — dress waist alignment](https://www.create-enjoy.com/2012/09/sewing-circle-and-how-to-sew-with.html)
