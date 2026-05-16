# TASK — Front: seletor de peça + medidas dinâmicas

**Tipo:** Infraestrutura UI + catálogo  
**Prioridade:** P0 (bloqueia todas as peças)  
**Estimativa de ficheiros:** ~8  
**Depende de:** nenhum  
**Bloqueia:** todas as TASK de peça

---

## Objetivo

Adicionar bloco **Peça** no painel esquerdo do protótipo para escolher qual produto modelar (`blusa`, `manga`, `camisa`, …), carregar apenas os sliders necessários e chamar `draft(measurements, { productId })`.

---

## Ficheiros a criar/alterar

| Ação | Caminho |
|------|---------|
| Criar | `remodellista/catalog/products.ts` |
| Criar | `remodellista/catalog/products.test.ts` |
| Criar | `remodellista/engine/registry.ts` |
| Criar | `remodellista/engine/registry.test.ts` |
| Alterar | `remodellista/engine/index.ts` — `productId` em `DraftOptions` |
| Alterar | `remodellista/index.html` — bloco Peça + container medidas |
| Alterar | `remodellista/app.ts` — wiring completo |
| Alterar | `remodellista/styles.css` — `.product-picker`, `.measure.hidden` |
| Alterar | `remodellista/app.test.ts` |

---

## `catalog/products.ts` — linha a linha

```ts
export type ProductId =
  | "blusa"
  | "manga"
  | "camisa"
  | "saia-reta"
  | "calca"
  | "vestido"
  | "top-sem-mangas";

export interface ProductDefinition {
  id: ProductId;
  label: string;
  description: string;
  measurementFields: MeasurementFieldKey[];
  implemented: boolean;
}

export type MeasurementFieldKey =
  | "bust"
  | "height"
  | "waist"
  | "wrist"
  | "sleeveLength"
  | "hip"
  | "hipDepth"
  | "skirtLength"
  | "crotchDepth"
  | "inseam";

export const PRODUCTS: ProductDefinition[] = [
  {
    id: "blusa",
    label: "Blusa",
    description: "Bodice frente e costas",
    measurementFields: ["bust", "height", "waist"],
    implemented: true,
  },
  // manga: + wrist, sleeveLength
  // camisa: igual manga + blusa
  // ...
];

export function getProduct(id: ProductId): ProductDefinition;
export function listProducts(onlyImplemented?: boolean): ProductDefinition[];
```

- Linha `implemented: false` → opção desabilitada no `<select>` com sufixo “(em breve)”.

---

## `engine/registry.ts`

```ts
import type { ProductDraftFn } from "./types.js";

export function registerProduct(id: string, draftFn: ProductDraftFn): void;
export function draftProduct(
  productId: string,
  measurements: Measurements,
  options: DraftOptions
): DraftResult;
```

- `draftProduct` delega para `products/blouse.ts`, etc.
- Erro explícito: `unknown_product` se id não registado.

---

## `index.html` — estrutura

Inserir **antes** do `<h2>Medidas</h2>`:

```html
<section class="panel sidebar">
  <h2>Peça</h2>
  <label class="product-picker">
    <span>Modelar</span>
    <select id="product"></select>
  </label>
  <h2>Medidas</h2>
  <div id="measures-root">
    <!-- sliders existentes com data-measure="bust" etc. -->
  </div>
</section>
```

- Cada slider: `data-measure="bust"` para show/hide.
- Remover duplicação de painel se Medidas e Peça ficarem no mesmo `.panel.sidebar`.

---

## `app.ts` — comportamento

1. **Init**
   - `populateProductSelect()` — loop `listProducts(true)` ou todos com disabled.
   - Default: `blusa`.
   - `applyProduct("blusa")` — visibility + guardrails + render.

2. **`applyProduct(id)`**
   - Para cada `data-measure`: `hidden` se não está em `product.measurementFields`.
   - Trocar guardrails: `getGuardrails(productId)` (API unificada por produto).
   - `resolveMeasurements` com defaults seguros para campos ocultos (manter último valor em memória).

3. **`#product` change**
   - `applyProduct(newId)` → `render()`.

4. **`render()`**
   - `draft(readMeasurements(), { productId, legacySeventh })`.
   - `preview.innerHTML = renderDraftToSvg(result)` — múltiplos paths se várias pieces.

5. **Formulas/context**
   - Incluir `productId` e lista `pieces.map(p => p.id)`.

---

## Testes obrigatórios (100% coverage alvo)

### `catalog/products.test.ts`

| # | `it(...)` |
|---|-----------|
| 1 | `getProduct returns definition for blusa` |
| 2 | `getProduct throws for unknown id` |
| 3 | `listProducts filters implemented when flag true` |
| 4 | `each product has at least one measurement field` |

### `engine/registry.test.ts`

| # | `it(...)` |
|---|-----------|
| 1 | `draftProduct blusa returns two piece ids` |
| 2 | `draftProduct unknown throws` |
| 3 | `registerProduct allows extension` |

### `app.test.ts` (adicionar)

| # | `it(...)` |
|---|-----------|
| 1 | `populates product select on load` |
| 2 | `changing product updates visible measure sliders` |
| 3 | `render includes svg for selected product` |
| 4 | `throws when #product missing` |

---

## Critérios de aceite

- [ ] Dropdown com pelo menos Blusa (ativa) e Camisa/Manga/Saia/Calça (desativadas até implementadas).
- [ ] Ao trocar peça, sliders não usados desaparecem sem quebrar `draft`.
- [ ] Preview atualiza em tempo real (evento `input` nos sliders).
- [ ] `npm run test:coverage` — 100% em `catalog/` e `registry.ts`.
- [ ] Snapshot Vitest do SVG default da blusa em `render/svg.test.ts`.

---

## CSS

```css
.product-picker select {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.35rem;
}
.measure[data-measure].hidden {
  display: none;
}
```

---

## Notas

- Não misturar `options.piece: "front"|"back"` — deprecar em favor de `productId: "blusa"`.
- Regra do sétimo única: `seventhFromBustCm` (sem toggle no UI).
