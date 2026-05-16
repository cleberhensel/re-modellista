# Curvas Bézier, manga e algoritmo `addHandles`

## Cava costas — pontos explícitos (`armholeBack`)

Entrada: `intersection` do ombro com divisão virtual.

| Ponto | Coordenadas (resumo) |
|-------|----------------------|
| p1 | x: borda interna cava + 1cm; y: `intersection.y` |
| p2 | x: idem; y: `3*seventhPx.one + start - seventhPx.two - seventhPx.four` |
| p2 handles | `hIn=(0,-two)`, `hOut=(0,+two)` |
| p3 | x: `getWidthPx - seventhPx.two + 1cm`; y: `3*one + four + start - 1cm` |
| p3 handles | ±`(four/2, four/2)` |
| p4 | x: `getWidthPx + 1cm`; y: `3*one + two + start` |
| p4 handle in | `(-four/2, -four/4)` |

## Manga — estratégia geral (`drawer.sleeve`)

### Largura da manga

```javascript
var armhole = new Path(/* 4 segmentos cava frente */);
var width = armhole.length;  // comprimento da curva da cava em px, NÃO o busto
```

A largura do **capuz da manga** deriva do **perímetro da cava** — técnica clássica para igualar cabedal.

### Grelha de construção

Canvas largura ≈ `width*2 + margens`, altura ≈ `l_sleeve * oneCmInPx`.

Linhas horizontais em y:

- `start`
- `seventhPx.two`
- `seventhPx.one + seventhPx.two`
- `seventhPx.one * 2`

Linhas verticais em x:

- `(width + start) / 2` — esquerda
- `width + start` — centro
- `(width + start) / 2 + (width + start)` — direita (simetria)

### Interseções e offsets (pontos da manga)

| Ponto | Construção |
|-------|------------|
| p1 | `(start, seventhPx.one*2)` |
| p2 | interseção `center_left ∩ line_h3`, depois `x -= 3.3*oneCmInPx` |
| p3 | interseção `center_left ∩ line_h2`, `y += 2.5*oneCmInPx` |
| p4 | segunda interseção `line_h2`, `x += 2.5*oneCmInPx` |
| p5 | `center ∩ line_h1` |
| p6 | `center_right ∩ line_h2` |
| p7 | `center_right ∩ line_h3`, `x += seventhPx.one - oneCmInPx` |
| p8 | `(width*2 + start, seventhPx.one*2)` |

### Suavização — `addHandles`

Polígono aberto p1…p8 → aplica `addHandles` **por ordem** nos segmentos 4, 0, 1, 3, 2, 7, 5, 6 (não sequencial 0..7) — ordem escolhida empiricamente para forma de capuz.

## Algoritmo `addHandles(segment)` (detalhe matemático)

Objetivo: calcular `handleIn`/`handleOut` de um vértice para spline suave estilo Paper.js.

### `getVector(p1, p2)`

```
return Point(p2.x - p1.x, p2.y - p1.y)
```

### `getMaxHandleSize(segment)`

```
prevLen = |segment.previous → segment|
nextLen = |segment → segment.next|
return min(prevLen, nextLen)
```

Limita handles para evitar overshoot.

### Casos

**Extremo inicial** (`segment.previous === null`):

```
next = vector(point → next)
nextnext = vector(next.point → next.next)
handleOut = next + nextnext;  handleOut.length = |next|/2
handle = handleOut * Point(1,0)  // só componente x
```

**Extremo final** — simétrico com `prev + prevprev`.

**Vértice interior — vizinhos com mesma y:**

```
handle = Rectangle(prev, point).topCenter - point, invertido
handle.length = getMaxHandleSize / 1.7
```

**Vértice interior — handles vizinhos já definidos:**

```
handleIn = vector(prev.handleOut+prev, point)
handleOut = vector(point, next.handleIn+next)
handle = normalize(handleIn + handleOut); length = maxSize/3
```

**Vértice interior — default:**

```
handle = prev + next;  handle.length = maxSize/2.5
```

Retorno:

```
Segment(point, handle*-1, handle)
```

Versão `basic-blouse.js` lab adiciona `+oneCmInPx` em alguns ramos do terceiro caso — micro-diferença face a `core/`.

## Variante experimental (`basic-blouse-2` manga)

Em vez de `addHandles`, usa:

```
alg = seventh().four + 0.3
vec.v1 = (i2-i1) * alg
handles manuais com valores fixos (-155,0), (155,0), (-118,-100), etc.
```

Indica **tuning manual** de Bézier por tentativa, não só fórmulas proporcionais.

## Punho (`widthFist` + linhas de fecho)

```
widthFist = f_width * oneCmInPx + 5 * oneCmInPx
margin_left = width*2 - widthFist
punho: linha horizontal em y = l_sleeve * oneCmInPx
laterais: dos cantos da linha h4 até aos extremos do punho
```

## Comprimento de manga

`l_sleeve` entra apenas na horizontal do punho e altura do canvas — o capuz usa sobretudo `width` da cava e sétimos.
