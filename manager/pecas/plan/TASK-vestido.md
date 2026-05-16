# TASK — Produto composto: Vestido

**Product ID:** `vestido`  
**Composição:** `blusa` (truncada à cintura) + `saia-reta` (alinhada na cintura)  
**Ficha:** [../vestido.md](../vestido.md)  
**Prioridade:** P3  
**Depende de:** [TASK-blusa.md](TASK-blusa.md), [TASK-saia-reta.md](TASK-saia-reta.md)

---

## Objetivo

Um produto no seletor que garante **continuidade de cintura** entre bodice e saia e gera 4 sub-peças (ou 2 se união visual):

- `blouse-front` (altura = até cintura)
- `blouse-back`
- `skirt-front`
- `skirt-back`

---

## Medidas compostas

```ts
interface DressMeasurements extends BodiceMeasurements, SkirtMeasurements {
  bodiceLength: number;  // comprimento até cintura (substitui height total)
}
```

**UI:** bust, bodiceLength, waist, hip, hipDepth, skirtLength.

- `height` do bodice = `bodiceLength`, não comprimento total.
- Validar: `bodiceLength + skirtLength` ≈ altura vestido desejada (hint UI).

---

## Alinhamento cintura (núcleo)

```ts
function draftDress(m: DressMeasurements, options): DraftResult {
  const blouseCtx = buildContext({
    bust: m.bust,
    height: m.bodiceLength,
    waist: m.waist,
    wrist: m.wrist,
    sleeveLength: m.sleeveLength,
  }, options);
  const skirtCtx = buildSkirtContext({
    waist: m.waist,
    hip: m.hip,
    hipDepth: m.hipDepth,
    skirtLength: m.skirtLength,
  }, options);

  const waistClosedBlouse = waistQuarterAfterDarts(blouseCtx);
  const waistTopSkirt = skirtCtx.waistQuarterPx;
  if (Math.abs(waistClosedBlouse - waistTopSkirt) > k) {
    return { error: "waist_mismatch", ... };
  }

  const front = draftBlouseFrontToWaist(blouseCtx);
  const back = draftBlouseBackToWaist(blouseCtx);
  const skirtF = draftSkirtFront(skirtCtx, { offsetY: blouseCtx.hemY });
  const skirtB = draftSkirtBack(skirtCtx, { offsetY: blouseCtx.hemY });
  ...
}
```

### Função `waistQuarterAfterDarts`

- Simular fecho virtual das pences (reduzir largura cintura em `dartSpread * 2` no centro).

---

## Offset vertical saia

- `skirt` origem Y = `blouseCtx.hemY` (mesma linha de cintura no SVG).
- Fio colinear: mesmo X de fio blusa e saia.

---

## Guardrails

- Herdar blusa + saia.
- `bodiceLength` min: `minHeightCm(bust)` (regra blusa).
- `bodiceLength + skirtLength` max: 160 cm.
- `waist_mismatch` → auto-ajustar saia waist quarter para blusa (resolver) ou bloquear slider.

---

## Testes

| # | Caso |
|---|------|
| 1 | 4 pieces returned |
| 2 | skirt offsetY === blouse hemY |
| 3 | waist mismatch triggers resolve |
| 4 | guardrails bodiceLength < height total |

---

## Preview

- 4 paths; opcional linha guia horizontal em `hemY` (tracejado, fase 2).

---

## Critérios de aceite

- [ ] Vestido no seletor após blusa+saia.
- [ ] Alterar cintura afeta blusa e saia coerentemente.
- [ ] 100% coverage `products/dress.ts`.

---

## Variantes futuras (fora de escopo)

- Empire waist (junção no busto)
- Vestido com manga → `vestido-com-manga` produto
