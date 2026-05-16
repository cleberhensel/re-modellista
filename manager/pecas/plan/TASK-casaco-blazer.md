# TASK — Peça completa: Casaco / blazer

**Product ID:** `casaco`  
**Ficha:** [../casaco-blazer.md](../casaco-blazer.md)  
**Prioridade:** P4  
**Depende de:** [TASK-blusa.md](TASK-blusa.md), [TASK-manga.md](TASK-manga.md), [TASK-complementares.md](TASK-complementares.md) (lapela)

---

## Objetivo

Bloco exterior derivado do bodice com ease explícito, ombro alargado, manga com ease no bíceps, e lapela (fase 2).

---

## Medidas adicionais

```ts
interface CoatMeasurements extends BodiceMeasurements {
  designEaseBust: number;      // default 6 cm
  shoulderStructureCm: number; // default 1.5 cm
  coatLength: number;          // substitui height
  lapelWidth?: number;
}
```

---

## Fase 1 — Bodice exterior (sem lapela)

### Transformação medidas

```ts
function buildCoatContext(m: CoatMeasurements, options) {
  const effectiveBust = m.bust + m.designEaseBust;
  return buildContext({ ...m, bust: effectiveBust, height: m.coatLength }, options);
}
```

### Geometria

- `draftCoatFront(ctx)` — fork `blouse-front` com:
  - `shoulderEnd.x += shoulderStructureCm * k`
  - `sideSeam` + ease lateral `0.5 * k` na cava
- `draftCoatBack(ctx)` — idem costas

Produto:

```ts
pieces: [coat-front, coat-back]
productId: "casaco"
```

---

## Fase 2 — Manga casaco

- `draftCoatSleeve`: `gridWidth = armholeLength * 1.08` (ease cabeça).
- Bíceps: +2 cm cada lado.

---

## Fase 3 — Lapela

- Construção geométrica por reflexão linha de abertura (ver ficha).
- Pieces: `lapel-front`, `facing-front` (forro fora de escopo MVP).

---

## Guardrails

- `designEaseBust` 2–12 cm
- `coatLength` > blusa min height
- Estabilidade ombro com ease (recalcular intersection)

---

## Testes

| # | Caso |
|---|------|
| 1 | coat bust effective > raw bust |
| 2 | shoulder wider than blouse |
| 3 | coat sleeve gridWidth > blouse sleeve |
| 4 | 100% coat product modules |

---

## Front

Sliders: todos bodice + designEase + coatLength. Produto desativado até fase 1 completa.

---

## Critérios de aceite fase 1

- [ ] Casaco = 2 pieces (frente/costas) com ease visível vs blusa lado a lado (offset preview).
- [ ] Não regressão blusa woven.

---

## Prioridade produto

Baixa — implementar após camisa + complementares colarinho.
