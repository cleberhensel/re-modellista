# TASK — Peça completa: Manga set-in

**Product ID:** `manga`  
**Sub-peças:** `sleeve` (único molde; simetria interna)  
**Ficha:** [../manga.md](../manga.md)  
**Prioridade:** P0  
**Depende de:** [TASK-blusa.md](TASK-blusa.md) (perímetro cava frente)  
**Especificação de domínio:** [../manga.md](../manga.md) — portar para TS; zero dependência de `backend/`.

---

## Objetivo

Implementar manga como peça completa independente no seletor, calculando cabeça a partir da cava da **blusa frente** (motor interno) e punho a partir de `wrist` + 5 cm.

---

## Medidas de entrada

| Campo UI | `Measurements` | Obrigatório |
|----------|------------------|-------------|
| Busto | `bust` | Sim (sétimos + draft cava) |
| Comprimento corpo | `height` | Sim (contexto cava) |
| Cintura | `waist` | Sim |
| Punho | `wrist` | Sim |
| Manga | `sleeveLength` | Sim |

Motor usa apenas nomes semânticos (`wrist`, `sleeveLength`).

---

## Ficheiros

| Ação | Caminho |
|------|---------|
| Criar | `engine/sleeve-grid.ts` — linhas horizontais/verticais, interseções i1–i5 |
| Criar | `engine/sleeve-handles.ts` — port `addHandles` |
| Criar | `engine/pieces/sleeve.ts` |
| Criar | `engine/pieces/sleeve.test.ts` |
| Criar | `engine/products/sleeve.ts` |
| Criar | `engine/guardrails/sleeve.ts` |
| Alterar | `engine/types.ts` — `DraftMeta.armholeLength`, `SleeveContext` |
| Criar | `engine/fixtures/sleeve-golden.ts` |

---

## Algoritmo — passo a passo

### Fase A — Obter escala da cava

1. `ctx = buildContext(measurements)`
2. `front = draftBlouseFront(ctx)` — se erro, abort `sleeve_armhole_unavailable`
3. Reconstruir path só da cava (segmentos `armholePathSegments`)
4. `armholeLength = approximateBezierLength(segments)` — implementar `geometry/pathLength.ts`:
   - Linhas: distância euclidiana
   - Cubics: subdivisão 20 steps ou fórmula Simpson
5. `gridWidth = armholeLength` (comprimento da cava no motor)

### Fase B — Grelha manga

Constantes (ficha manga):

| Linha Y | Valor |
|---------|-------|
| h0 | `startOne` |
| h1 | `startOne + s.two` |
| h2 | `startOne + s.one + s.two` |
| h3 | `startOne + 2*s.one` |
| punho | `startOne + sleeveLength * k` |

| Linha X | Valor |
|---------|-------|
| left | `(gridWidth + startOne) / 2` |
| center | `gridWidth + startOne` |
| right | espelho |

Offsets interseções (cm → px):

- i1: `(-3k, +3k)` do canto superior esquerdo da zona cabeça
- i2: `(+2.5k, +2.5k)` em dois pontos da linha h1
- i5: `+(s.one - k)` em X

### Fase C — Polígono 8 vértices p1…p8

Mapear cada vértice da ficha para `Point2` absolutos no TS.

### Fase D — `addHandles`

Portar casos:

| Caso | Condição | Handle |
|------|----------|--------|
| Extremo | índice 0 ou n-1 | média vizinhos / 2 |
| Mesma Y | `prev.y === next.y` | topCenter / 1.7 |
| Handles existentes | soma / 3 |
| Default | (prev+next) / 2.5 |

Aplicar ordem da ficha: segmentos `[4,0,1,3,2,7,5,6]`.

### Fase E — Punho

```
widthFist = wrist * k + 5 * k
marginLeft = gridWidth * 2 - widthFist
```

Linha punho: `(marginLeft + startOne, yWrist)` → `(marginLeft + startOne + widthFist, yWrist)`.

### Fase F — Paths export

Converter polígono+handles em `PathSegment[]` (cubics entre vértices).

---

## `products/sleeve.ts`

```ts
export function draftSleeve(m, options): DraftResult {
  const ctx = buildContext(m, options);
  const front = draftBlouseFront(ctx);
  if (front.error) return { productId: "manga", pieces: [{ id: "sleeve", paths: [], error: front.error }], ... };
  const sleeve = draftSleevePiece(ctx, front);
  return { productId: "manga", ctx, pieces: [sleeve], bounds: computeBounds([sleeve], ctx), meta: { armholeLength } };
}
```

---

## Guardrails `sleeve.ts`

| Regra | Detalhe |
|-------|---------|
| `sleeveLength` min | `s.two + s.one` (cabeça cabe) |
| `sleeveLength` max | 65 cm absoluto |
| `wrist` min | 14; max | `bust * 0.28` |
| Estabilidade | `draftBlouseFront` sem erro |
| Punho | `widthFist < gridWidth * 2` |

---

## Testes (100%)

### `pathLength.test.ts`

- linha reta = comprimento conhecido
- cubic quarter circle ≈ tolerância

### `sleeve-handles.test.ts`

- caso mesma Y
- caso default

### `sleeve.test.ts`

- defaults → paths > 0
- armhole unavailable quando bust extremo
- widthFist formula
- meta.armholeLength > 0

### Golden fixture

- `armholeLength` para bust 92/45/81 fixado em `sleeve-golden.ts`; teste compara com tolerância 0.01.

---

## Critérios de aceite

- [ ] Seletor “Manga” mostra um molde com cabeça curva + punho.
- [ ] Alterar busto altera largura da cabeça (via cava).
- [ ] Sliders punho/manga visíveis; busto/altura/cintura também (necessários).
- [ ] Coverage 100% nos módulos novos.

---

## Evolução futura (motor)

- Costas da cava no `gridWidth` — `manga-v2-back-armhole`.
- Relatório de ease `L_cap - L_armhole` em `meta`.
