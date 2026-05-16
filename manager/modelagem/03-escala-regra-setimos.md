# Escala cm↔px e regra dos sétimos

## Constantes de conversão (empíricas)

Várias constantes coexistem no repositório — **não há uma única fonte de verdade**.

| Fonte | `oneCmInPx` | `onePxInCm` | Notas |
|-------|-------------|-------------|-------|
| `basic-blouse.js`, `core/basic-blouse.js` | **28.347** | **0.0353** | Comentário: “Valor de resposta do InD.” (InDesign) |
| `module-basic-blouse.js` (`basic_config`) | **35.379** | 0.02645833333333 | Comentário: “valor da internet” (≈ 96 DPI / 2.54) |
| Valores comentados (não usados) | 37.79527559055, 39.379, 41.379 | — | Testes de impressão |

**Implicação:** moldes impressos ou PDFs gerados por módulos diferentes **não têm a mesma escala física** sem recalibrar.

### Fórmulas

```
px = ceil(cm * oneCmInPx)          // altura e quarto de busto
cm ≈ px * onePxInCm                // inverso aproximado
```

`getWidthPx`:

```
bust_four = parseInt(width) / 4
getWidthPx = ceil(bust_four * oneCmInPx)
```

`getHeightPx`:

```
getHeightPx = ceil(parseInt(height) * oneCmInPx)
```

`getHipPx` (versão lab `basic-blouse.js`):

```
hip_four = parseInt(c_width) / 4
getHipPx = hip_four * oneCmInPx
```

Versão antiga (`core/basic-blouse.js`, `basic-blouse-2`):

```
getHipPx = (getHipWidth.four * oneCmInPx) - (3 * oneCmInPx)   // bug provável: falta () em .four
```

## Regra dos sétimos (núcleo da modelagem)

Base: **meio-busto** em cm, não o busto total.

```
bust_two = parseInt(width) / 2
seventh_raw = bust_two / 7
seventh_table = parseInt(seventh_raw.toString().substring(0, 3))
```

### Truncamento peculiar

`seventh_table` **não é** `floor(bust_two/7)` nem arredondamento matemático: converte o quociente para string, corta **3 caracteres** desde o início, e parseia de volta para inteiro.

Exemplo: `width = 92` → `bust_two = 46` → `46/7 ≈ 6.571` → string `"6.571"` → substring(0,3) → `"6.5"` → `parseInt` → **6** (não 7).

Isto é comportamento legado a preservar ou corrigir explicitamente numa migração.

### Derivações (em cm, depois × `oneCmInPx`)

| Símbolo código | Fórmula (cm) | Uso típico |
|----------------|--------------|------------|
| `seventh().one` | `seventh_table` | Gola, passo vertical, manga |
| `seventh().two` | `seventh_table / 2` | Ombro, largura retângulos cava |
| `seventh().four` | `seventh_table / 4` | Ajustes finos cava, retângulo 3 |
| `seventhPx().one/two/four` | cada × `oneCmInPx` | Todas as coordenadas |

## Ponto de origem do desenho

| Versão | `startPoint()` |
|--------|----------------|
| `core/basic-blouse.js` | escalar `10` |
| `basic-blouse.js` (lab) | `{ one: 10 + oneCmInPx, two: 10 }` |
| `basic-blouse-2` | `0` |
| `module-basic-blouse` | `10` |

Todas as fórmulas somam `startPoint().one` ou `startPoint()` ao posicionar — mudar origem desloca o molde inteiro.

## Retângulos guia (marcação, não sempre traçados)

Coordenadas no formato Paper.js `Path.Rectangle(x, y, width, height)`:

**Base:**

```
[x0, y0, w, h] = [start.one, start.one, getWidthPx(), getHeightPx()]
```

**rectangleRightOne** — faixa lateral direita (zona ombro/cava):

```
start_x = getWidthPx() - seventhPx.two + start.one
height  = seventhPx.one * 3 + seventhPx.two
width   = seventhPx.two
```

**rectangleRightTwo** — deslocada à esquerda por `seventhPx.four`.

**rectangleRightThree** — quadrado `seventhPx.four × seventhPx.four` no canto inferior da zona de cava.

Estes retângulos implementam o método de **quadrantes proporcionais ao sétimo** usado em moldes femininos básicos (construção clássica de blusa).

## Constantes mágicas adicionais (cm → px)

| Constante | Valor | Onde |
|-----------|-------|------|
| Offset cava p2 | `7 * oneCmInPx` | `armhole()` p2.y |
| Profundidade pence | `12 * oneCmInPx` | `centerLinePence` |
| Abertura pence na base | `1.5 * oneCmInPx` (3/2 cm) | `rightSidePence` / `leftSidePence` |
| Margem lateral costura | `1 * oneCmInPx` | várias linhas tracejadas |
| Punho extra | `5 * oneCmInPx` | `widthFist` |
| Manga: offset interseção | `3.3`, `2.5` cm | `sleeve()` |
| Algoritmo cava | `alg = seventh().four + 0.3` | handle Bézier p2 |
