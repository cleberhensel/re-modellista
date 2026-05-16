# TASK — Motor de composição (`composeGarment`)

**Prioridade:** P0  
**Onda:** 0  
**Depende de:** geometria estável ([../plan-update/](../plan-update/))  
**Bloqueia:** todas as TASK `*-completa`

---

## Objetivo

Camada única que monta `DraftResult` a partir de `productId` + `DraftOptions` + receita, em vez de cada `products/*.ts` hardcodar arrays de peças.

---

## Entregas

| Ficheiro | Acção |
|----------|-------|
| `engine/composition/types.ts` | `PartSlotId`, `GarmentRecipe`, `CompositionState` |
| `engine/composition/recipes/blouse-base.ts` | Slots bodice, sleeve, collar, cuff, placket, pockets |
| `engine/composition/recipes/skirt.ts`, `pant.ts` | Slots inferiores |
| `engine/composition/compose.ts` | `composeGarment()`, `getRecipe(productId)` |
| `engine/composition/registry.ts` | Mapa `productId` → recipe |
| `engine/products/*.ts` | Delegar para `composeGarment` |

---

## Comportamento

1. Carregar receita do produto.
2. `resolveOptions(recipe, options)` — aplicar defaults e dependências (`cuff` ⇒ `sleeve`).
3. Para cada slot activo, chamar drafter(s); concatenar `pieces`.
4. `computeBounds` + `productId` + `meta: { activeSlots: [...] }`.

---

## Critérios de aceite

- [ ] `composeGarment('blusa', m, { includeSleeve: false })` → 2 peças
- [ ] `composeGarment('blusa', m, { includeSleeve: true, includeCollar: true })` → 2 + sleeve + 2 collar
- [ ] `composeGarment('camisa', m, defaults)` → igual ao `draftShirt` actual (regressão)
- [ ] Testes unitários por slot e por dependência
- [ ] `listRegisteredProducts` inalterado para o utilizador

---

## Referências

- [00-modelo-composicao.md](00-modelo-composicao.md)
- Implementação actual: `engine/products/shirt.ts`, `blouse.ts`
