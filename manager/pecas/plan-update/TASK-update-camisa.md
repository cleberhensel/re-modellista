# TASK — Atualizar produto completo: Camisa

**Product ID:** `camisa`  
**Tipo:** Atualização — **produto composto completo**  
**Prioridade:** P0  
**Depende de:** [TASK-update-blusa.md](TASK-update-blusa.md), [TASK-update-validacao-e-render.md](TASK-update-validacao-e-render.md)  
**Ficha:** [../camisa.md](../camisa.md), [../complementares.md](../complementares.md)

---

## Objetivo

Uma seleção de **Camisa** deve gerar **todas** as peças para vestir/montar: corpo (frente + costas), manga set-in, pé e aba de gola, punho, carcela, bolso de peito — com layout SVG em fila e perímetros compatíveis entre peças.

**Não** é aceitável `camisa` = só blusa + manga (estado atual).

---

## Peças no `DraftResult` (alvo)

| `PatternPiece.id` | Origem |
|-------------------|--------|
| `blouse-front` | `draftBlouseFront` |
| `blouse-back` | `draftBlouseBack` |
| `sleeve` | `draftSleevePiece` |
| `collar-stand` | `draftCollarStand` |
| `collar-fall` | `draftCollarFall` |
| `cuff` | `draftCuff` |
| `placket` | `draftPlacket` |
| `chest-pocket` | `draftChestPocket` |

---

## Problemas atuais

| Peça | Problema |
|------|----------|
| Corpo | Herda erros da blusa (ver TASK-update-blusa) |
| Manga | Assimetria pernas; punho alinhado à direita; cabeça só da cava frente; p7–p8 com nó |
| Colarinho | `necklineLength` frágil; não usa perímetro real do decote |
| Punho | Duplicado: embutido na manga + produto `punho` separado |
| Carcela / bolso | Não chamados em `products/shirt.ts` |
| Layout | 3 peças sem ordem estável para 8 |

---

## Fórmulas alvo — manga (produto camisa)

Derivar de **ambas** as cavas quando possível; mínimo: frente + ajuste costas.

```
AH_f = pathLength(armhole front)
AH_b = pathLength(armhole back)
gridWidth = (AH_f + AH_b) / 2   // ou max(AH_f, AH_b) + fator — documentar escolha
CAP_EASE_TARGET = 3.5 * k       // 3,2–4,4 cm industria
```

### Grelha (TASK-manga + legado)

```
h1 = startOne
h2 = startOne + s.two
h3 = startOne + s.one + s.two
h4 = startOne + 2*s.one
yWrist = startOne + sleeveLength * k
marginLeft = 2*gridWidth - widthFist
cuffLeft  = (startOne + marginLeft, yWrist)
cuffRight = (startOne + marginLeft + widthFist, yWrist)
```

### Cabeça manga

- Curvas p1–p7 com `applySleeveHandles` ordem `[4,0,1,3,2,7,5,6]`  
- **p7→p8:** segmento reto (evitar nó)  
- Pernas: p1→cuffLeft, p8→cuffRight (vertical na direita se p8.x = cuffRight.x)

---

## Fórmulas alvo — complementos

### Colarinho

```
NC = pathLength(decote frente) + pathLength(decote costas)  // cubics gola apenas
lenStand = NC + 0.5*k
lenFall  = NC + 0.5*k
```

Fonte camisa: [Style2Designer shirt](https://style2designer.com/pattern-cutting-cad-cam/cutting-sewing-techniques/shirt-sleeve-cuff-collar-drafting/)

### Punho

```
widthFist = wrist*k + 5*k
heightCuff = 3*k
```

### Carcela

```
length = 12*k  // 9–12 cm industria
width  = 3*k
```

### Bolso

Ancorado em `blouse-front.points` — retângulo ~10×15 cm em px proporcional ao `k`.

---

## Alterações em código

| Ficheiro | Ação |
|----------|------|
| `engine/products/shirt.ts` | `draftShirt` compõe **8** peças |
| `engine/pieces/sleeve.ts` | Corrigir punho, cabeça, AH médio |
| `engine/pieces/collar.ts` | `necklineLength` via `pathLength` decote completo |
| `engine/pieces/cuff.ts`, `placket.ts`, `pocket.ts` | Integrar no shirt |
| `engine/guardrails/shirt.ts` | Validar cap ease, colarinho vs NC |
| `render/layout.ts` | Ordem: frente, costas, manga, gola×2, punho, carcela, bolso |
| `catalog/products.ts` | Medidas UI se faltar |

---

## Critérios de aceite

- [ ] `draft({ productId: "camisa" })` → **8** peças com paths não vazios  
- [ ] Layout: 8 `minX` distintos ou 2 linhas sem sobreposição  
- [ ] Manga: cap ease entre 3,2 e 4,4 cm (medida automática)  
- [ ] Colarinho: comprimento ≥ 0,95 × NC medido no corpo  
- [ ] Visual: sem auto-interseção em manga e corpo  
- [ ] Teste integração `camisa` com snapshot de contagem de paths  

---

## Referências

- [anicka.design — set-in sleeve](https://anicka.design/how-to-draft-a-basic-sleeve-pattern/)
- [Stitch Paper Scissors — placket](https://stitchpaperscissors.com/how-to-draft-a-shirt-sleeve-placket/)
- Legado: `basic-blouse.js` `drawer.sleeve`, `basic-shirt.js`
