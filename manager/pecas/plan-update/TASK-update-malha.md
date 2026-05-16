# TASK — Atualizar produto completo: Malha (knit)

**Product ID:** `malha`  
**Prioridade:** P1  
**Depende de:** [TASK-update-blusa.md](TASK-update-blusa.md)  
**Ficha:** [../malha-knit.md](../malha-knit.md)

---

## Objetivo

Bloco **malha** completo (frente + costas): redução percentual nas medidas, **sem pences** (`suppressDarts`), cava simplificada opcional — mesma qualidade de contorno que blusa woven corrigida.

---

## Problemas atuais

- `applyFabricProfile` reduz medidas mas geometria = woven  
- Pences suprimidas só não desenham tracejados; outline pode reservar espaço  
- Sem regras de elasticidade na cava (negative ease)  

---

## Fórmulas alvo

```
knitReduction = 0.05–0.08   // 5–8% bust/waist
measurementsKnit = measurements * (1 - reduction)
suppressDarts = true
```

### Cava malha (opcional)

```
armholeDepthOffsetCm = 1
simplificar handles p3 (menor s.four)
```

Fonte: [Sister Mountain knit sleeve](https://www.sistermountain.com/blog/design-knit-set-in-sleeve) — `CH ≈ 0.65 × AD`

---

## Ficheiros

| Ficheiro | Ação |
|----------|------|
| `engine/fabric.ts` | Perfis knit documentados |
| `engine/products/knit.ts` | Context + flags |
| `engine/pieces/blouse-*.ts` | Ramo `suppressDarts` no outline |
| `engine/guardrails/knit.ts` | Sem pences, medidas reduzidas |

---

## Critérios de aceite

- [ ] 2 peças, sem segmentos pence no SVG  
- [ ] Bounds menores que blusa mesmas medidas UI  
- [ ] Contorno contínuo pós TASK-update-blusa  
