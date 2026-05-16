# Matemática, algoritmos e estruturas de dados

## Espaço de trabalho 2D

### Sistemas de coordenadas

- **Origem** no canto superior esquerdo do retângulo base (convencão CAD têxtil e canvas HTML).
- Eixo **X** → largura (meio frente para lateral); **Y** ↓ comprimento (ombro → bainha).
- **Fio (grainline):** direção vertical preferencial do tecido; no Modellista, segmento do ombro ao hem no centro.

### Unidades

| Domínio | Unidade | Notas |
|---------|---------|-------|
| Entrada utilizador | cm (inteiros no UI) | 0–200 no formulário SPA |
| Cálculo interno Modellista | px lógicos | `oneCmInPx ≈ 28.347` (calibração impressão) |
| PDF exportado | px do SVG Paper | Não há metadados mm/pt explícitos |
| Industria / pesquisa | mm ou polegadas | 1" = 2,54 cm; 96 DPI ≈ 37,8 px/cm |

**Conversão correta para impressão 1:1:**

```
px = cm × (DPI / 2,54)
```

O valor 28,347 é **empírico** (comentário InDesign no código), não DPI padrão.

## Álgebra das medidas no bloco blusa

### Quartos e meios

Para meio corpo (frente direita espelhada):

```
W_bust_quarter = ⌈ bust / 4 ⌉   (em cm, depois × escala)
W_hip_quarter  = c_width / 4
H_body         = ⌈ height ⌉
```

Largura do retângulo de trabalho em px ≈ `W_bust_quarter × k` com `k = oneCmInPx`.

### Regra dos sétimos (forma geral na literatura)

Base industrial frequente:

```
S = (bust / 2) / 7    // “um sétimo” do meio-busto
```

Usos típicos de `S`, `S/2`, `S/4`:

- Altura/largura de zona de ombro e cava
- Passo vertical entre linhas de construção da manga
- Ajuste fino de gola

**Implementação Modellista (diferença importante):**

```javascript
seventh_table = parseInt(((bust/2)/7).toString().substring(0, 3))
```

Isto introduz **discontinuidades** não presentes em manuais que usam arredondamento decimal normal.

## Geometria da cava e da manga

### Comprimento de arco

Perímetro da cava (frente) é essencial para manga:

```
L_armhole = ∫_Γ ds  ≈  suma de segmentos Bézier discretizados
```

No Paper.js: `path.length` após construir a cava — **o Modellista usa isto como largura característica da manga** (`width = armhole.length`).

### Folga de cabeça de manga (ease)

Na teoria:

```
L_sleeve_cap_sewing ≈ L_armhole + E_cap
```

`E_cap` típico ~1–2,5 cm dependendo de tecido e ângulo de entrada. O código antigo fixava manga com `23 × oneCmInPx` em `module-basic-blouse.sleeve` — **não** derivado só da cava.

### Curvas Bézier cúbicas

Segmento entre pontos P0 e P3 com handles H1 (out de P0) e H2 (in de P3):

```
B(t) = (1-t)³P0 + 3(1-t)²t H1 + 3(1-t)t² H2 + t³ P3,  t ∈ [0,1]
```

**Cava frente Modellista:** 4 pontos; handle de P2 derivado por vetor escalado:

```
alg = seventh_four + 0.3
v = (P2 - P1) × alg
handle_out(P2) = (v + P1) - P2   // forma relativa usada no Segment Paper.js
```

**Costas:** handles em múltiplos fixos de `seventhPx.two` e `seventhPx.four/2`.

### Suavização `addHandles` (manga)

Algoritmo heurístico por vértice de polilinha:

1. Calcula vetores aos vizinhos `prev`, `next`.
2. Limita comprimento do handle: `min(|prev|, |next|)` ou frações `/1.7`, `/2.5`, `/3`.
3. Casos especiais: extremos, vizinhos com mesma coordenada Y (usa `Rectangle.topCenter`).

Não é spline global minimizando curvatura — é **G1 aproximado** peça a peça.

## Pences (darts) — geometria

Pence triangular equivalente a remover área `A_dart`:

```
A_dart ≈ (1/2) × base × altura
```

No bloco:

- Apex conceptual na zona busto/cintura (não sempre explícito como ponto único no código).
- **Profundidade:** linha começa `12 cm` acima da bainha (constante).
- **Abertura na bainha:** `3 cm` total (1,5 cm cada lado do centro).

Manipulação de pence (teoria): conservar `A_dart` ao mudar posição do apex.

## Interseções e construção

Operações usadas:

- `Path.getIntersections(Path)` — ombro ∩ linha de divisão virtual → início da cava.
- Deslocamentos posteriores em px fixos (`3.3 cm`, `2.5 cm`) nos pontos da manga.

Estrutura algorítmica típica:

```
1. Construir primitivas (linhas, retângulos)
2. Calcular interseções
3. Instanciar pontos de curva
4. Opcional: suavizar / exportar
```

## Estruturas de dados (recomendadas vs legado)

### Legado Modellista

| Estrutura | Conteúdo |
|-----------|----------|
| `config` global | Medidas cruas no window |
| `drawer` objeto | Funções que mutam estado implícito (`this.width`, …) |
| Paper.js `Path` / `Segment` | Geometria viva no canvas |
| `translateSvg.load` output | `{ width, height, break_svg: { paths, lines, polygons } }` ou `paths[]` |

### Modelo ideal para migração (domínio + CAD)

```typescript
type Cm = number;
type Point2 = { x: Cm; y: Cm };
type CubicBezier = { p0: Point2; p1: Point2; p2: Point2; p3: Point2 };
type Dart = { apex: Point2; leg1: Point2; leg2: Point2 };
type PatternPiece = {
  id: string;
  outline: (Line | CubicBezier)[];
  grainLine: [Point2, Point2];
  seamAllowance: OffsetCurve[];  // ou cópia offset
  notches: Point2[];
};
type Measurements = {
  bust: Cm; bodyLength: Cm; waist: Cm; hip?: Cm;
  sleeveLength: Cm; wrist: Cm;
};
```

**Operações de domínio puras:** `computeSeventhGrid(m)`, `draftBodiceFront(m) → PatternPiece`, `draftSleeve(armholeLength) → PatternPiece`.

**Adaptadores:** `toPaperJs`, `toSvgPaths`, `toPdfKit`.

## Complexidade e validação

| Operação | Complexidade típica |
|----------|---------------------|
| Retângulos + linhas guia | O(1) |
| Interseção linha-linha | O(1) |
| Comprimento Bézier | O(n) discretização ou fórmula fechada por segmento |
| Offset de margem de costura | O(n) vértices; offset de curvas é não trivial |
| Verificar `L_cap ≈ L_armhole + E` | O(1) após integração |

**Testes golden:** medidas fixas → hash do SVG ou comprimentos de arco esperados.

## Pesquisa computacional relacionada

- Geração automática de control points Bézier a partir de pontos de construção (CAD paramétrico).
- **Biarcs** para export industrial em DXF.
- Flattening 3D→2D com restrições de costura (arxiv 2202.10272).
- FreeSewing: fórmulas declarativas por medida (`options`, `points`, `paths`).
