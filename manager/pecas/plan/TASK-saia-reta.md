# TASK — Peça completa: Saia reta

**Product ID:** `saia-reta`  
**Sub-peças:** `skirt-front`, `skirt-back` (quartos; espelhar em export)  
**Ficha:** [../saia-reta.md](../saia-reta.md)  
**Prioridade:** P2  
**Depende de:** [TASK-front-seletor-pecas.md](TASK-front-seletor-pecas.md)

---

## Objetivo

Bloco inferior independente do busto/sétimos. Medidas próprias; não reutilizar `buildContext` do bodice sem adaptação.

---

## Novos tipos (`engine/types.ts`)

```ts
export interface SkirtMeasurements {
  waist: number;
  hip: number;
  hipDepth: number;
  skirtLength: number;
}

export type Measurements = BodiceMeasurements | SkirtMeasurements | CompositeMeasurements;
```

**MVP:** union type + type guard `isSkirtMeasurements(m)`.

---

## Contexto `buildSkirtContext(m, options)`

| Campo | Fórmula |
|-------|---------|
| `waistQuarterPx` | `floor(waist/4) * k` |
| `hipQuarterPx` | `floor(hip/4) * k` |
| `hipLineY` | `startOne + hipDepth * k` |
| `hemY` | `startOne + skirtLength * k` |
| `easeWaist` | 0 fase 1 (param futuro) |

---

## `skirt-front.ts` — construção

1. Origem `(startOne, startOne)`.
2. Linha CF: vertical até `hemY`.
3. Linha cintura: de CF a `(waistQuarterPx + startOne, startOne)` com curva suave (quadratic ou cubic):
   - Diferença `hipQuarter - waistQuarter` distribuída em curva.
4. Linha quadril em `hipLineY`: até `hipQuarterPx + startOne`.
5. Lateral: reta `(hipX, hipY)` → `(hipX, hemY)`.
6. Bainha: até CF.
7. Pence frente: intake menor (~1.25 cm total) — `dartSpread = 0.625 * k`.
8. Fio: meio do quarto.

## `skirt-back.ts`

- Pence maior (~2.5 cm total).
- Mesma grelha; `dartCenterX` pode deslocar 1 cm para costas (documentar na ficha).

---

## Produto `products/straight-skirt.ts`

```ts
pieces: [draftSkirtFront(ctx), draftSkirtBack(ctx)]
productId: "saia-reta"
```

---

## Guardrails

| Campo | Min | Max |
|-------|-----|-----|
| waist | 56 | 120 |
| hip | waist * 1.0 | waist * 1.35 |
| hipDepth | 18 | 26 |
| skirtLength | 30 | 90 |
| Relação | `hip >= waist` | |

Check: `hipLineY < hemY - 5*k`.

---

## Front

Sliders adicionais quando `saia-reta`:

- `hip` (Quadril)
- `hipDepth` (Altura quadril)
- `skirtLength` (Comprimento)

Ocultar `bust`, `wrist`, `sleeveLength`.

---

## Testes (100%)

| Módulo | Casos |
|--------|-------|
| `buildSkirtContext` | quarter px |
| `skirt-front` | closed contour segments |
| `skirt-back` | dart wider than front |
| `straight-skirt` product | 2 pieces |
| guardrails | hip < waist clamped |

---

## Legado

**Ausente** — validação por invariantes geométricos + revisão manual SVG.

---

## Critérios de aceite

- [ ] Saia não usa `seventhFromBustCm`.
- [ ] Peça completa = 2 paths no preview.
- [ ] Coverage 100% módulos saia.
