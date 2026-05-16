# TASK — Atualizar produto completo: Casaco

**Product ID:** `casaco`  
**Prioridade:** P2  
**Depende de:** [TASK-update-blusa.md](TASK-update-blusa.md), [TASK-update-camisa.md](TASK-update-camisa.md) (manga)  
**Ficha:** [../casaco-blazer.md](../casaco-blazer.md)

---

## Objetivo

Casaco **completo** = corpo com folga de vestir + manga com cabeça ampliada e comprimento `coatLength` — fase 1. Fase 2: ombro estrutural, lapela (fora desta TASK se P2).

---

## Problemas atuais

- Só `designEaseBust` e `gridWidthScale` 1.08 na manga  
- Sem `shoulderStructureCm`, sem lapela  
- Corpo = blusa com ease parcial  

---

## Fórmulas alvo — fase 1

```
effectiveBust = bust + designEaseBust
widthPx = ceil(floor(effectiveBust)/4 * k)
coatBodyLength = coatLength * k   // substitui height no contexto
sleeveCapScale = 1.08             // manter ou derivar de CAP_EASE maior
```

### Ease Aldrich (referência casaco)

```
E_bust = 7–10 cm sobre bloco justo
```

---

## Ficheiros

| Ficheiro | Ação |
|----------|------|
| `engine/products/coat.ts` | `buildContext` com bust effetivo + coatLength |
| `engine/pieces/sleeve.ts` | Escala cabeça configurável por produto |
| `engine/guardrails/coat.ts` | ease mínimo, comprimento > bodice |

---

## Critérios de aceite

- [ ] 3 peças: frente, costas, manga  
- [ ] Largura casaco > blusa mesmas medidas (bounds.width)  
- [ ] Fase 2 documentada em sub-task lapela  

---

## Referências

- Aldrich — outerwear blocks  
- `plan/TASK-casaco-blazer.md`
