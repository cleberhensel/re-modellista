# TASK — Variante: Top / blusa sem mangas

**Product ID:** `top-sem-mangas`  
**Natureza:** Variante do bodice, **não** peça separada no catálogo físico  
**Ficha:** [../top-sem-mangas.md](../top-sem-mangas.md)  
**Prioridade:** P3  
**Depende de:** [TASK-blusa.md](TASK-blusa.md)

---

## Objetivo

Reutilizar `blusa` com parâmetro `sleeveless: true` que aprofunda a cava e omite dependência de manga.

---

## Abordagem (não duplicar bodice inteiro)

### Opção escolhida: flags em `DraftOptions`

```ts
interface DraftOptions {
  productId: string;
  sleeveless?: boolean;
  armholeDepthOffsetCm?: number; // default 2
}
```

### Alterações `armhole.ts` / `armhole-back.ts`

```ts
export function computeArmholePoints(ctx, intersectionY, options?) {
  const ah = computeBase(...);
  if (options?.sleeveless) {
    ah.p4.x -= options.armholeDepthOffsetCm * ctx.k;
    // recalcular handles proporcionalmente
  }
  return ah;
}
```

- Documentar offset 1–3 cm conforme método.

### `products/sleeveless-top.ts` (alias)

```ts
export function draftSleevelessTop(m, options) {
  return draftBlouse(m, { ...options, sleeveless: true, productId: "top-sem-mangas" });
}
```

Mesmas 2 pieces: `blouse-front`, `blouse-back`.

---

## Medidas UI

Igual blusa: bust, height, waist. **Ocultar** wrist, sleeveLength.

---

## Guardrails

- Herdar `blouse` guardrails.
- Extra: se `sleeveless`, verificar `armholePerimeter` > threshold mínimo (decote não invertido).

---

## Testes

| # | Caso |
|---|------|
| 1 | sleeveless p4.x < standard p4.x |
| 2 | draftSleevelessTop ids unchanged |
| 3 | guardrails stable with offset |
| 4 | snapshot diff front armhole vs blusa |

---

## Critérios de aceite

- [ ] Seletor “Top sem mangas” ativo.
- [ ] Cava visualmente mais funda que blusa com manga.
- [ ] Não registar `manga` como dependência.
- [ ] 100% coverage em branches `sleeveless`.

---

## Não fazer

- Produto separado `top-front.ts` copy-paste
- Raglan (outro productId futuro)
