# TASK — Atualizar produto completo: Calça e Bermuda

**Product ID:** `calca` (+ variante `bermuda` ou opção de comprimento)  
**Prioridade:** P1  
**Ficha:** [../calca.md](../calca.md)  
**Legado parcial:** `modelista-completo/backend/.../pants-front.js`

---

## Objetivo

Calça **completa** (frente + costas) com gancho fechado correto, perímetro gancho F+B validado, entrepernas e lateral contínuos — não retângulo com diagonal genérica.

Bermuda = mesmo algoritmo com `outseam` / comprimento de perna limitado.

---

## Problemas atuais

- Contorno simplificado; gancho não fecha perímetro real  
- `frontExtension = (hip/2/8)*k` sem validação com Aldrich  
- Sem taper coxa/joelho (aceitável fase 1 se documentado)  
- Sem produto `bermuda` no registry  
- Sem cós integrado  

---

## Fórmulas alvo — Aldrich / Burda

```
CD = crotchDepth * k + startOne     // medida sentada obrigatória
CD_fallback = 0.175 * waist + 15.4   // só se medida ausente

frontExtension = H/12 + 1.5*k      // Aldrich (em px: hipQuarter rules)
backExtension  = frontExtension + (4~4.75)*k  // por faixa cintura

hipQuarterPx   = (hip/4) * k
waistQuarterPx = (waist/4) * k
inseamY        = crotchLineY + inseam * k
outseamY       = startOne + (inseam + crotchDepth) * k  // validar
```

### Gancho frente (sequência)

1. CF cintura → lateral cintura  
2. Lateral → quadril/gancho  
3. Curva Bézier gancho: `(startOne, inseamY)` ↔ `(crotchX, crotchLineY)`  
4. Entrepernas subindo CF  
5. **Não** repetir segmento horizontal no gancho  

### Gancho costas

- Extensão maior que frente  
- Pence cintura 2–3 cm  
- Diagonal gancho costas 4–4,75 cm (tabela Aldrich por cintura)  

### Validação

```
perimeterFrontCrotch + perimeterBackCrotch ≈ tabela industria (28–40 cm para H 90–100)
```

---

## Bermuda

| Campo | Regra |
|-------|------|
| `outseam` ou `inseam` | Comprimento final ≤ 55 cm típico |
| `productId` | `bermuda` em `catalog/products.ts` OU `DraftOptions.legLength: "bermuda"` |
| Algoritmo | `outseamY = crotchLineY + bermudaLength * k` |

---

## Ficheiros

| Ficheiro | Ação |
|----------|------|
| `engine/pant-context.ts` | Fórmulas Aldrich, fallback CD |
| `engine/pieces/pant-front.ts` | Reescrever contorno + gancho |
| `engine/pieces/pant-back.ts` | Idem |
| `engine/products/pant.ts` | Variante bermuda |
| `engine/guardrails/pant.ts` | Validar gancho, inseam < outseam |
| `catalog/products.ts` | Entrada `bermuda` se produto separado |
| `engine/fixtures/pant-golden.ts` | Novo |

---

## Critérios de aceite

- [ ] Contorno fechado sem cruzamento em frente e costas  
- [ ] Gancho: curva suave CF ↔ lateral  
- [ ] Teste: perímetro gancho > perímetro frente isolado  
- [ ] Bermuda: bainha acima do joelho com medidas padrão  
- [ ] Layout 2 peças lado a lado  

---

## Referências

- [Burda — trouser block PDF](https://assets.burdastyle.com/pdf_files/assets/000/101/886/constructing-the-basic-trouser-block_original.pdf)
- [Algodão Cru — calça base BR](https://algodaocru.com.br/molde-de-calca-feminina-molde-base)
- [NuriaMo crotch extension](https://nuriamo.com/drafting-trousers-101/)
