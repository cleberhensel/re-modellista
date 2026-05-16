# TASK — Atualizar produto completo: Blusa

**Product ID:** `blusa`  
**Tipo:** Atualização de algoritmo (pós-implementação)  
**Prioridade:** P0  
**Depende de:** [TASK-update-validacao-e-render.md](TASK-update-validacao-e-render.md) (parcial)  
**Fichas:** [../blusa-frente.md](../blusa-frente.md), [../blusa-costas.md](../blusa-costas.md)  
**Legado:** `modelista-completo/core/basic-blouse.js` (`basicBlouseFront`, `basicBlouseBack`, `armhole`, `armholeBack`)

---

## Objetivo

Entregar **blusa completa** (frente + costas) com geometria alinhada à modelagem plana BR + paridade verificável com o legado, corrigindo problemas atuais de ombro, cava, decote e contorno descontínuo.

---

## Problemas atuais (motor TS)

| Área | Sintoma | Causa provável |
|------|---------|----------------|
| Costas | Ombro longo / zigzag no decote | Contorno ligava `shoulderEnd` → `p1` da cava; gola não terminava em `shoulderStart` (−1 cm) |
| Costas | Cava com “gancho” | `p3.y = p2.y - k` em vez de fórmula legado |
| Frente | Cava vs ombro | Interseção ombro × divisão deve alimentar só `p1.y`; handles cava frente |
| Geral | CF / pences | Tracejados OK; falta validar spread e posição vs sétimos |
| Colarinho derivado | Perímetro errado se gola mudar | `collar.ts` usa 1.º segmento — depende desta TASK |

---

## Fórmulas alvo

### Retângulo e sétimos (manter `seventh.ts`, validar)

```
widthPx  = ceil(floor(bust) / 4 * k)
heightPx = ceil(floor(height) * k)
hipPx    = floor(waist) / 4 * k
```

### Frente (BR — Cortando e Costurando)

```
AD = tabela(BA) ou BW/2 * 1,10          // altura cava
divX = widthPx - s.two - s.four/2 + startOne
decote frente: profundidade AD/3 + 0,5k
ombro: queda AD/6 + 1k
cintura frente: W/4 + 2k (pence) + 0,5k
```

### Costas — `armholeBack` (legado `drawer.armholeBack`)

```
p1.x = widthPx + startOne - s.two - s.four + k
p1.y = intersectionY
p2   = (p1.x, s.one*3 + startOne - s.two - s.four)
p3   = (widthPx + startOne - s.two + k, s.one*3 + s.four + startOne - k)
p4   = (widthPx + startOne + k, s.one*3 + s.two + startOne)
p3 handles: ±(s.four/2, s.four/2)
p4 handleIn: (-s.four/2, -s.four/4)
```

### Contorno costas (sequência)

1. Gola Bézier: `cfNeck` → `shoulderStart` (handle `3k`, `k/2`)  
2. Ombro: `shoulderStart` → `intersection` (linha virtual −1 cm)  
3. `intersection` → `p1` se Δ > ε  
4. Cava `p1…p4`  
5. Lateral `p4` → `sideTop` → `sideBottom` (legado: `widthPx + startOne - 4k` na bainha)  
6. Bainha → CF  

### Ombro costas (construção tracejada)

```
shoulderStart = (s.one + startOne - k, startOne)
shoulderEnd   = (widthPx + startOne, s.two + startOne)
```

---

## Ficheiros a alterar

| Ficheiro | Ação |
|----------|------|
| `engine/pieces/blouse-front.ts` | Revisar contorno, handles, pontos |
| `engine/pieces/blouse-back.ts` | Aplicar sequência acima |
| `engine/armhole.ts` | Validar `alg = seventh.four + 0.3`, handles p3 |
| `engine/armhole-back.ts` | Fórmulas legado (já parcialmente corrigido) |
| `engine/guardrails/blouse.ts` | `dartClearsArmhole`, ombro estável |
| `engine/fixtures/blouse-golden.ts` | Pontos-chave frente/costas |
| `engine/products/blouse.ts` | Sem mudança estrutural |

---

## Critérios de aceite

- [ ] `draft({ productId: "blusa" })` → 2 peças, sem `error`  
- [ ] Contorno sólido contínuo frente e costas (sem `M` espúrio no ombro)  
- [ ] `pieceBounds` costas: cava sem auto-interseção  
- [ ] Golden: `p1`, `p4`, `intersection`, `shoulderStart` dentro de 2 px do legado exportado (script de comparação)  
- [ ] Guardrails estáveis para medidas padrão (bust 92, height 45, waist 81)  
- [ ] Perímetro cava frente exportado em `points.armhole` para manga  

---

## Testes

| Teste | Descrição |
|-------|-----------|
| `blouse-front.test.ts` | Interseção ombro, grainline |
| `blouse-back.test.ts` | Ordem p2 < p3 < p4 em Y |
| `armhole-back.test.ts` | Fórmulas p1–p4 |
| `integration.test.ts` | Produto blusa + resolve instável |
| Novo `blouse-golden.test.ts` | Snapshot coordenadas 8 pontos |

---

## Referências

- [Cortando e Costurando — molde blusa](https://cortandoecosturando.com/index.php/2023/05/05/molde-basico-blusas/)
- [Dresspatternmaking — ease Aldrich](https://dresspatternmaking.com/patternmaking-basics/analyzing-other-block-making-intro/ease-in-the-bodice-general)
- `manager/modelagem/14-validacao-motor-vs-legado.md`
