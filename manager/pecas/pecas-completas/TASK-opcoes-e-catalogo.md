# TASK — Opções de composição e catálogo

**Prioridade:** P0  
**Onda:** 0  
**Depende de:** [TASK-composicao-motor.md](TASK-composicao-motor.md)

---

## Objetivo

Estender `DraftOptions` e `ProductDefinition` para descrever quais toggles cada produto expõe e valores por defeito (presets).

---

## `DraftOptions` (alvo)

| Campo | Tipo | Uso |
|-------|------|-----|
| `includeSleeve` | `boolean` | Manga set-in |
| `sleevePreset` | `'short' \| 'threeQuarter' \| 'long'` | Atalho sobre `sleeveLength` |
| `includeCollar` | `boolean` | Pé + aba gola |
| `includeCuff` | `boolean` | Punho (requer manga) |
| `includePlacket` | `boolean` | Carcela CF |
| `includeChestPocket` | `boolean` | Bolso peito |
| `includeSidePocket` | `boolean` | Bolso lateral (jaqueta) |
| `includeWaistband` | `boolean` | Já existe — formalizar na receita |
| `includePantPocket` | `boolean` | Fase 2 calça |
| `sleeveless` | `boolean` | Mantém — força `includeSleeve: false` |
| `lockedSlots` | `PartSlotId[]` | Ex.: casaco trava manga longa |

---

## `ProductDefinition` (alvo)

```typescript
interface ProductDefinition {
  // ...existente
  recipeId: string;
  compositionDefaults: Partial<DraftOptions>;
  compositionFields: PartSlotId[];
}
```

---

## Guardrails

- Desligar manga → não correr validação cap ease.
- Ligar colarinho → perímetro decote mínimo.
- `bermuda` → `legLengthCm` default; não mostrar slot manga.

---

## Critérios de aceite

- [ ] Catálogo lista `compositionFields` por produto
- [ ] `getProduct('camisa').compositionDefaults` reflecte preset camisa
- [ ] Guardrails não rebentam com slots OFF
- [ ] Testes `catalog/products.test.ts` actualizados
