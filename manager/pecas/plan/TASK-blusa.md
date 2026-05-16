# TASK — Peça completa: Blusa (bodice frente + costas)

**Product ID:** `blusa`  
**Sub-peças:** `blouse-front`, `blouse-back`  
**Ficha:** [../blusa-frente.md](../blusa-frente.md), [../blusa-costas.md](../blusa-costas.md)  
**Prioridade:** P0  
**Depende de:** [TASK-front-seletor-pecas.md](TASK-front-seletor-pecas.md)  
**Especificação de domínio:** [../blusa-frente.md](../blusa-frente.md), [../blusa-costas.md](../blusa-costas.md) — portar fórmulas para TS; sem import do repositório legado.

---

## Objetivo

Unificar frente e costas num único produto `blusa`. O utilizador seleciona “Blusa” e recebe **dois** `PatternPiece` no `DraftResult`, validados por testes Vitest com valores esperados fixos.

---

## Estado atual

| Sub-peça | Motor TS |
|----------|----------|
| Frente | `pieces/blouse-front.ts` ✅ |
| Costas | stub `piece: "back"` vazio ❌ |
| Guardrails | só `blouse-front` ❌ | — |
| Produto `blusa` | não existe ❌ | desenha 2 canvas |

---

## Ficheiros

| Ação | Caminho |
|------|---------|
| Criar | `engine/pieces/blouse-back.ts` |
| Criar | `engine/pieces/blouse-back.test.ts` |
| Criar | `engine/armhole-back.ts` |
| Criar | `engine/armhole-back.test.ts` |
| Criar | `engine/products/blouse.ts` |
| Criar | `engine/products/blouse.test.ts` |
| Criar | `engine/guardrails/blouse.ts` (unificado) |
| Alterar | `engine/guardrails/index.ts` — registrar `blusa` |
| Alterar | `engine/index.ts` — remover `options.piece` |
| Criar | `engine/fixtures/blouse-golden.ts` — valores esperados para testes |
| Deprecar | `guardrails/blouse-front.ts` → reexport de `blouse.ts` |

---

## `blouse-back.ts` — implementação (ficha costas)

### Entrada

Mesmo `DraftContext` que frente (`buildContext(measurements)`).

### Passo 1 — Erro estrutural

Reutilizar `lineIntersection` ombro × divisão virtual com **ombro deslocado**:

```ts
const shoulderStart = point(
  s.one + startOne - k,
  startOne
);
```

(Ficha costas: ombro deslocado `-1 cm` em X.)

### Passo 2 — Paths (ordem contorno, sem margens tracejadas)

1. CF costas: `(startOne, startOne + s.one)` → `(startOne, hemY)` — legado usa `start + 3*k` em shirt; **fase 1:** igual frente; **fase 2:** flag `shirtVariant`.
2. Gola costas — `collar-back.ts` helper:
   - `collar_seg1`: from `(startOne, 3*k + startOne)`, handleOut `(3*k + startOne, k/2)`
   - `collar_seg2`: to `(s.one + startOne, startOne)`
3. Ombro → interseção
4. `armholeBackPathSegments(ahBack)` — 4 segmentos
5. Lateral → bainha `(hipPx + startOne, hemY)` → `(startOne, hemY)`
6. Pences (mesmas fórmulas frente):
   - `dartCenterX = (hipPx + startOne) / 2`
   - `dartTopY = hemY - 12 * k`
   - spread `(k * 3) / 2`
7. Fio: `x = widthPx/2 + startOne`, interseção ombro → hem

### Passo 3 — Retorno

```ts
return {
  id: "blouse-back",
  paths,
  points: { ... },
  error?: "shoulder_virtual_no_intersection",
};
```

---

## `armhole-back.ts` — pontos (ficha blusa-costas)

| Ponto | Fórmula (px, relativo a ctx) |
|-------|------------------------------|
| p1 | `(divX, intersectionY)` |
| p2 | `(divX, s.one*3 - s.two - s.four + startOne)` handles ±`s.two` vertical |
| p3 | `(widthPx + startOne - s.two, p3y)` com `p3y` inclui `-k` |
| p4 | `(widthPx + startOne, armholeLineY)` handle in `(-s.four/2, -s.four/4)` |

Exportar:

- `computeArmholeBackPoints(ctx, intersectionY): ArmholePoints`
- `armholeBackPathSegments(ah): PathSegment[]` — mesma semântica Paper.js que `armhole.ts` (CP1 = p + handleOut).

---

## `products/blouse.ts`

```ts
export function draftBlouse(
  measurements: Measurements,
  options: DraftOptions
): DraftResult {
  const ctx = buildContext(measurements, options);
  const front = draftBlouseFront(ctx);
  const back = draftBlouseBack(ctx);
  const pieces = [];
  if (front.paths.length) pieces.push(front);
  if (back.paths.length) pieces.push(back);
  const bounds = computeBounds(pieces, ctx);
  return { productId: "blusa", ctx, pieces, bounds };
}
```

- Se frente tem `error`, propagar em `pieces[0].error` e costas vazia ou também erro.

---

## `guardrails/blouse.ts`

Unificar:

- `isBlouseStable(m, options)` = frente estável **e** costas estável.
- `getFieldRange` — igual frente atual.
- `resolve` — após clamp, verificar ambas; loop bust/height como hoje.

Checks costas em `guardrails/checks.ts`:

- `shoulderIntersectsBack(ctx)`
- `dartClearsArmhole(ctx)` — reutilizar (mesma hem)

---

## Testes — lista completa

### `blouse-back.test.ts`

| # | Caso |
|---|------|
| 1 | defaults 92/45/81 → paths.length >= 10 |
| 2 | shoulder no intersection → error, paths [] |
| 3 | armhole segments: 1 line + 2 cubic + lines |
| 4 | dartCenterX uses hip not width |
| 5 | collar cubic starts at collarStart |

### `armhole-back.test.ts`

| # | Caso |
|---|------|
| 1 | p2.y formula matches seventh combo |
| 2 | segments order p1-p2 line, p2-p3 cubic, p3-p4 cubic |

### `products/blouse.test.ts`

| # | Caso |
|---|------|
| 1 | returns exactly 2 pieces ids front+back |
| 2 | bounds encompass both |
| 3 | front error → piece error set |

### Golden tests (`engine/fixtures/blouse-golden.ts`)

| Campo | Medidas 92/45/81 | Tolerância |
|-------|------------------|------------|
| `front.dartCenterX` | valor calculado uma vez, fixado no fixture | < 0.01 px |
| `back.dartCenterX` | idem | < 0.01 px |
| `front.collarEnd` | `{ x, y }` fixos | < 0.01 px |
| `back.collarEnd` | `{ x, y }` fixos | < 0.01 px |

---

## Critérios de aceite

- [ ] Seletor “Blusa” mostra 2 paths no SVG (ou 2 `<path>` elements).
- [ ] Costas visualmente distinta (cava mais curta, gola 3cm).
- [ ] Guardrails impedem combinações que quebram frente **ou** costas.
- [ ] 100% coverage: `blouse-back.ts`, `armhole-back.ts`, `products/blouse.ts`, `guardrails/blouse.ts`.
- [ ] `npm run test:coverage` passa.

---

## Ordem de execução interna

1. `armhole-back.ts` + testes  
2. `blouse-back.ts` + testes  
3. `products/blouse.ts` + registry  
4. Guardrails unificado  
5. Remover `options.piece`  
6. Golden fixtures  
7. Snapshot SVG opcional em `render/svg.test.ts` para 2 paths

---

## Fora de escopo (esta task)

- Margens de costura tracejadas
- Retângulos guia
- FBA / manipulação de pences
