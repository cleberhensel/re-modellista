# TASK — Atualizar produto completo: Top sem mangas

**Product ID:** `top-sem-mangas`  
**Prioridade:** P1  
**Depende de:** [TASK-update-blusa.md](TASK-update-blusa.md)  
**Ficha:** [../top-sem-mangas.md](../top-sem-mangas.md)

---

## Objetivo

Top = corpo completo (frente + costas) com cava **sem manga**: mais profunda, decote/ombro estáveis, flag `sleeveless` aplicada de forma visível e medível.

---

## Problemas atuais

- Reusa blusa com `sleeveless: true` apenas desloca `p4` em −2 cm  
- Não diferencia alça / decote mais aberto  
- Guardrails = blusa (sem regras de cava profunda)  

---

## Fórmulas alvo

```
armholeDepthOffsetCm = 2 (default), UI 1–3 cm
p4.x -= offset * k   // frente e costas
```

Opcional BR: `AD` aumentado em 1,5*k vs blusa.

### Contorno

- Mesma sequência que blusa após TASK-update-blusa  
- Sem linhas de manga / punho  

---

## Ficheiros

| Ficheiro | Ação |
|----------|------|
| `engine/products/sleeveless-top.ts` | Passar offset configurável |
| `engine/armhole.ts`, `armhole-back.ts` | Profundidade sleeveless documentada |
| `engine/guardrails/sleeveless-top.ts` | `armholeDepth` mínimo, estabilidade |
| `catalog/products.ts` | Slider `armholeDepth` opcional |

---

## Critérios de aceite

- [ ] Cava visivelmente mais funda que blusa (comparação `pathLength` cava +10%)  
- [ ] 2 peças, contorno contínuo  
- [ ] Sem peça manga no resultado  
