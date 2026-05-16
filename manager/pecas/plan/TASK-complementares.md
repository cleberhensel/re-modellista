# TASK — Complementares (colarinho, punho, cós, bolso, carcela)

**Product ID:** múltiplos ou `complementares` com sub-tipo  
**Ficha:** [../complementares.md](../complementares.md)  
**Prioridade:** P3  
**Depende de:** [TASK-blusa.md](TASK-blusa.md), [TASK-manga.md](TASK-manga.md), [TASK-camisa.md](TASK-camisa.md)

---

## Objetivo

Implementar aviamentos como peças draftáveis que **consumem geometria** das peças principais (perímetro decote, comprimento manga, etc.).

---

## Estratégia de produto

### Fase 1 — Punho standalone (extrair da manga)

**Product ID:** `punho`  
- Retângulo: `(wrist * k + ease) × cuffHeight` (altura 2.5–3 cm).  
- Já parcialmente em manga — extrair `pieces/cuff.ts`.

### Fase 2 — Colarinho camisa

**Product ID:** `colarinho`  
**Depende de:** decote frente+costas da `blusa`.

```ts
interface CollarInput {
  necklineLengthFront: number;
  necklineLengthBack: number;
  neckDrop?: number;
}
```

Algoritmo:

1. `approximatePathLength(collarCurveFront + collarCurveBack)`.
2. Pé de colarinha: retângulo curvo comprimento = neckline + 0.5 cm overlap.
3. Aba: duplicar com roll line offset.

Ficheiros:

- `engine/pieces/collar-stand.ts`
- `engine/pieces/collar-fall.ts`
- `engine/products/collar.ts` → pieces `[collar-stand, collar-fall]`

### Fase 3 — Cós

**Product ID:** `cos`  
- Medidas: `waist`, `height` (altura cós 3–4 cm).  
- Retângulo `(waist + overlap) × height`.

### Fase 4 — Bolso patch

**Product ID:** `bolso-peito`  
- Parâmetros posição relativos a `shoulderStart` da frente.  
- Retângulo + linha de dobra.

### Fase 5 — Carcela

**Product ID:** `carcela`  
- Extensão CF frente; depende altura decote.

---

## Integração camisa

Atualizar `products/shirt.ts`:

```ts
pieces: [
  ...blouse,
  ...sleeve,
  ...draftCollar({ blousePieces }),
]
```

Guardrails camisa: validar colarinho só se decote estável.

---

## Seletor front

Opção A: produtos separados no dropdown (`Punho`, `Colarinho`, …).  
Opção B: sub-menu “Complementos” — fase 2.

MVP: integrar punho só via `manga`; colarinho como produto `colarinho` separado.

---

## Testes por peça

| Peça | Casos |
|------|-------|
| cuff | width from wrist+5cm |
| collar | length >= neckline |
| waistband | waist + buttonEase |
| pocket | inside blouse bounds |
| placket | attaches to CF x=startOne |

Coverage 100% cada módulo.

---

## Margem de costura

Fase posterior: `PathSegment.dash = true` + layer SVG separado; não bloquear complementares.

---

## Critérios de aceite fase colarinho

- [ ] Perímetro decote calculado do motor, não hardcoded.
- [ ] Colarinho aparece ao modelar “Colarinho” ou “Camisa completa”.
- [ ] Documentar em ficha `complementares.md` estado Modellista.
