# Construção da blusa básica (frente e costas)

Referência principal: `drawer.basicBlouseFront`, `drawer.basicBlouseBack` em `backend/public/javascripts/modules/basic-blouse.js` (e equivalente em `core/basic-blouse.js`).

## Ordem de construção — frente

1. **Retângulo base** (`baseRectangleFront`) — contorno geral.
2. **Linha lateral esquerda** — do pescoço (`start + seventhPx.one`) à base.
3. **Linha de baixo** — de `start.one` até `getHipPx() + start.one` (largura de cintura/quadril na base, não largura total do busto).
4. **Retângulos guia** direitos (1, 2, 3) — opcionalmente só para marcação.
5. **Gola** — dois segmentos Bézier (`collar_seg1`, `collar_seg2`); cópia tracejada com `dash_sewing_margin = [8, 10]`.
6. **Linha de centro horizontal** (`lineCenter`) — nível da cava no busto.
7. **Ombro** (`shoulder`) — segmento de `(seventhPx.one + start, start)` a `(getWidthPx + start, seventhPx.two + start)`.
8. **Divisão virtual** (`virtualDivision`) — diagonal de construção; interseta ombro.
9. **Ombro visível** — do início do ombro até `intersection[0]` com a divisão.
10. **Margem ombro** — offset ~1 cm.
11. **Cava frente** — 4 segmentos Bézier (`armhole(intersection)`).
12. **Margem cava** — cópia com offset `+oneCmInPx` / `-oneCmInPx/2`.
13. **Lateral direita** (`rightSide`) — da altura da cava até à base na largura de quadril.
14. **Pences** — três linhas (`centerLinePence`, `rightSidePence`, `leftSidePence`).
15. **Fio** (`fio`) — vertical do meio: interseção do meio com ombro até à base no centro do busto (`getWidthPx/2`).

## Ombro (fórmula)

```
P0 = (seventhPx.one + start.one, start.one)
P1 = (getWidthPx + start.one, seventhPx.two + start.one)
```

## Divisão virtual (fórmula)

```
p1_x = getWidthPx - seventhPx.two - seventhPx.four/2 + start.one
p1_y = start.one
p2_x = p1_x (mesma x)
p2_y = seventhPx.one*3 + seventhPx.two - seventhPx.four + start.one
```

Interseção com ombro → ponto de início da cava na linha do ombro.

## Cava frente — pontos (`armhole`)

Parâmetro `alg = seventh().four + 0.3` (adimensional, escala handles).

| Ponto | x | y |
|-------|---|---|
| p1 | `getWidthPx - seventhPx.two - seventhPx.four/2 + start` | `intersection.y` |
| p2 | `getWidthPx - seventhPx.two - seventhPx.four + start` | `7*oneCmInPx + intersection.y` |
| p3 | `getWidthPx + start - seventhPx.two` | `(seventhPx.one*3 + seventhPx.two + start) - seventhPx.four` |
| p4 | `getWidthPx + start + oneCmInPx` | `seventhPx.one*3 + seventhPx.two + start` |

**Handles p3:** `hIn = (-four, -four)`, `hOut = (+four, +four)` em px.

**Handle p2 (tangente):**

```
p2_vec = (p2 - p1) * alg   // componente a componente
p2_hOut = (p2_vec + p1) - p2   // relativo ao ponto p2 no Paper Segment
```

Segmentos Paper.js:

- p1: sem handles
- p2: só `handleOut` = `p2_hOut`
- p3: `handleIn` e `handleOut`
- p4: sem handles

Comentário no código: **“Curva Francesa”** — na prática Bézier cúbica composta.

## Costas — diferenças

1. Ombro deslocado: `shoulder[0].x - oneCmInPx`.
2. Gola costas (`collarCircleBack`) — arco com centro deslocado; margem com `3*oneCmInPx`.
3. **Cava costas** (`armholeBack`) — 4 pontos com handles fixos em múltiplos de `seventhPx.two` e `seventhPx.four/2`, `four/4`.
4. Mesmas pences e fio (com offsets de costura nas variantes `basic-shirt-back.js`).

## Pences (dart)

Triângulo invertido na metade inferior:

```
y_top = getHeightPx + start - 12*oneCmInPx
y_base = getHeightPx + start
x_center = (getHipPx + start) / 2
```

- Linha central: `(x_center, y_top)` → `(x_center, y_base)`
- Lateral direita: `(x_center, y_top)` → `(x_center + 1.5*oneCmInPx, y_base)`
- Lateral esquerda: `(x_center, y_top)` → `(x_center - 1.5*oneCmInPx, y_base)`

Largura total na base ≈ **3 cm** (1.5 + 1.5).

## Lateral direita da frente

```
p1 = (getWidthPx + oneCmInPx + start, seventhPx.one*3 + seventhPx.two + start)
p2 = (getHipPx + start, getHeightPx + start)
```

Versão antiga usava `getWidthPx - 4*oneCmInPx` na base — substituída por `getHipPx` no lab.

## Export após desenho

```javascript
var svg = translateSvg.load(paper.project.exportSVG({asString: true}));
return { intersection, svg, svg_json: JSON.stringify(svg) };
```

A `intersection` da cava frente alimenta `drawer.sleeve(intersection)`.
