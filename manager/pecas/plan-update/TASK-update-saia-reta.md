# TASK — Atualizar produto completo: Saia reta

**Product ID:** `saia-reta`  
**Prioridade:** P1  
**Depende de:** [TASK-update-blusa.md](TASK-update-blusa.md) (opcional, cintura)  
**Ficha:** [../saia-reta.md](../saia-reta.md)

---

## Objetivo

Saia reta **completa** (frente + costas) com bloco Aldrich/BR: retângulo quadril, pences funcionais, curva cintura–quadril, opcional **cós** no mesmo produto (flag `includeWaistband`).

---

## Problemas atuais

- Pences desenhadas mas não fechadas virtualmente na junção cintura–quadril  
- Contorno lateral pode não fechar suavemente na bainha  
- Sem cós no produto `saia-reta` (só produto `cos` isolado)  
- `hipQuarterPx` vs `waistQuarterPx` sem ease explícito  

---

## Fórmulas alvo

### Aldrich (straight skirt block)

```
Largura retângulo = H/2 + 1,5 cm  (em px: hip/2 + 1.5*k)
Linha quadril   = startOne + hipDepth * k
Frente cintura  = W/4 + 4,25*k  (inclui pence)
Costas cintura  = W/4 + 2,25*k
Pences: 2 cm abertura, profundidade 14 cm (frente) / 12,5 e 10 cm (costas)
```

Fonte: [Compulsive Seamstress — Aldrich skirt](https://compulsiveseamstress.com/2011/08/18/drafting-a-skirt-block/)

### BR (alternativa)

```
Quarto quadril = hip/4 + startOne
Quarto cintura = waist/4 + startOne + ease
Curva quadril–cintura: ponto apoio 0,5*k no meio
```

---

## Sequência de construção

### Frente

1. CF topo → curva cintura até lateral  
2. Lateral: cintura → quadril → bainha  
3. Bainha → CF  
4. Tracejado: CF, pence (3 segmentos)  

### Costas

1. Idem + pence costas centrada  
2. Abertura centro costas (tracejado) se variante camisa — fase 2  

### Cós (opcional no produto)

```
waistbandWidth = waist * k + 4*k
waistbandHeight = 3*k ou medida UI
```

Anexar peça `waistband` ao `DraftResult` quando `includeWaistband: true`.

---

## Ficheiros

| Ficheiro | Ação |
|----------|------|
| `engine/skirt-context.ts` | Ease cintura/quadril configurável |
| `engine/pieces/skirt-front.ts` | Curvas cintura, pences |
| `engine/pieces/skirt-back.ts` | Idem costas |
| `engine/products/straight-skirt.ts` | Opção cós |
| `engine/guardrails/skirt.ts` | W < H, comprimento > 0 |
| `engine/fixtures/skirt-golden.ts` | Novo |

---

## Critérios de aceite

- [ ] 2 peças (mínimo) contorno fechado lateral  
- [ ] `hipLineY` e `hemY` coerentes com medidas  
- [ ] Golden: quartos cintura/quadril ±2 px  
- [ ] Com `includeWaistband`: 3 peças no layout  

---

## Referências

- Aldrich — capítulo skirt  
- [Pattern-Making.com straight skirt](https://pattern-making.com/draft-straight-skirt/)
