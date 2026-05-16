# TASK — Produto composto: Camisa

**Product ID:** `camisa`  
**Composição:** `blusa` + `manga` (+ futuro `complementares/collar`)  
**Ficha:** [../camisa.md](../camisa.md)  
**Prioridade:** P1  
**Depende de:** [TASK-blusa.md](TASK-blusa.md), [TASK-manga.md](TASK-manga.md), [TASK-front-seletor-pecas.md](TASK-front-seletor-pecas.md)

---

## Objetivo

Produto único no seletor que gera **3 sub-peças** num `DraftResult`: `blouse-front`, `blouse-back`, `sleeve`. Alinhar contrato de medidas com UI (corrigir swap punho/manga).

---

## Ficheiros

| Ação | Caminho |
|------|---------|
| Criar | `engine/products/shirt.ts` |
| Criar | `engine/products/shirt.test.ts` |
| Criar | `engine/guardrails/shirt.ts` — merge blusa + manga |
| Alterar | `catalog/products.ts` — `camisa` implemented |
| Alterar | `render/svg.ts` — layout 3 peças (offsets opcionais) |

---

## `products/shirt.ts`

```ts
export function draftShirt(m: Measurements, options: DraftOptions): DraftResult {
  const blouseResult = draftBlouse(m, options);
  const sleeveResult = draftSleeve(m, options);
  const pieces = [
    ...blouseResult.pieces,
    ...sleeveResult.pieces,
  ];
  const bounds = mergeBounds(blouseResult.bounds, sleeveResult.bounds);
  return {
    productId: "camisa",
    ctx: blouseResult.ctx,
    pieces,
    bounds,
    meta: { ...sleeveResult.meta },
  };
}
```

- Propagar erros: se manga falha, blusa ainda renderiza com `note` no sleeve piece.

---

## Preview SVG — layout

Opção MVP (sem offset):

- 3 `<path>` no mesmo viewBox; paths podem sobrepor — aceitável fase 1.

Opção fase 2:

```ts
function layoutPieces(pieces: PatternPiece[], gap = 40): PatternPiece[] {
  // translate back + sleeve in X
}
```

---

## Guardrails `shirt.ts`

```ts
resolve(m, changed, options) {
  const m1 = blouseGuardrails.resolve(m, changed, options);
  return sleeveGuardrails.resolve(m1, changed, options);
}
```

`isStable` = blusa estável ∧ manga estável.

---

## Correção semântica medidas (paridade SPA)

| UI label | Campo motor | Antes (bug URL) |
|----------|-------------|-----------------|
| Tórax | `bust` | width |
| Comprimento | `height` | heigth |
| Cintura | `waist` | c_width |
| Punho | `wrist` | ~~l_sleeve~~ |
| Manga | `sleeveLength` | ~~f_width~~ |

Documentar em `catalog/products.ts` — não alterar rotas Express nesta task (ACL futuro).

---

## Testes

| # | Caso |
|---|------|
| 1 | draftShirt → 3 pieces |
| 2 | ids únicos |
| 3 | meta.armholeLength presente |
| 4 | guardrails resolve wrist não quebra bust |
| 5 | renderDraftToSvg contém 3 path elements |

---

## Critérios de aceite

- [ ] Seletor “Camisa” ativo após blusa+manga prontos.
- [ ] Todos os 5 sliders visíveis.
- [ ] PDF multi-peça fora de escopo (backend).

---

## Fase 2 (referência)

- [TASK-complementares.md](TASK-complementares.md) — colarinho como 4ª piece
- Carcela, bolso
