# Modelo de composição — especificação

Contrato alvo para o motor e o front. Implementação em [TASK-composicao-motor.md](TASK-composicao-motor.md).

## Conceitos

| Termo | Significado |
|-------|-------------|
| **Part slot** | Identificador lógico (`sleeve`, `collar`, `chestPocket`, …) |
| **Part drafter** | Função que, dado `DraftContext`, devolve `PatternPiece` ou `null` |
| **Garment recipe** | Lista de slots + regras por `productId` |
| **Composition state** | Valores em `DraftOptions` (booleanos + enums) |
| **Active pieces** | Peças efectivamente incluídas no `DraftResult` |

## Slots padrão (corpo superior)

| Slot ID | Peças geradas | `DraftOptions` |
|---------|---------------|----------------|
| `bodice` | `blouse-front`, `blouse-back` | sempre ON para produtos de corpo |
| `sleeve` | `sleeve` | `includeSleeve: boolean` |
| `sleeveLength` | (mede manga) | `sleeveLength` cm; presets: short ≤25, long = medida |
| `collar` | `collar-stand`, `collar-fall` | `includeCollar: boolean` |
| `cuff` | `cuff` | `includeCuff: boolean` (só se `sleeve`) |
| `placket` | `placket` | `includePlacket: boolean` |
| `chestPocket` | `chest-pocket` | `includeChestPocket: boolean` |
| `sidePocket` | `side-pocket` | `includeSidePocket: boolean` |

## Slots inferiores

| Slot ID | Peças | `DraftOptions` |
|---------|-------|----------------|
| `skirt` | `skirt-front`, `skirt-back` | produto saia/vestido |
| `pant` | `pant-front`, `pant-back` | produto calça/bermuda |
| `waistband` | `waistband` | `includeWaistband` |
| `pantPocket` | (fase 2) | `includePantPocket` |

## Regras de dependência

```
includeCuff  => includeSleeve
includeCollar => bodice válido (decote desenhado)
includePlacket => produto camisa OU includePlacket explícito
casaco / jaqueta => includeSleeve === true && sleeveLength >= MIN_LONG_SLEEVE
colete / top-sem-mangas => includeSleeve === false && sleeveless === true
```

## Interface TypeScript (alvo)

```typescript
type PartSlotId =
  | "bodice"
  | "sleeve"
  | "collar"
  | "cuff"
  | "placket"
  | "chestPocket"
  | "sidePocket"
  | "skirt"
  | "pant"
  | "waistband";

interface PartSlotRule {
  slot: PartSlotId;
  defaultOn: boolean;
  allowed: boolean;
  required?: boolean;
  dependsOn?: PartSlotId[];
}

interface GarmentRecipe {
  productId: string;
  slots: PartSlotRule[];
  resolveOptions(opts: DraftOptions): DraftOptions;
}

function composeGarment(
  productId: string,
  measurements: Measurements,
  options: DraftOptions
): DraftResult;
```

## Mapeamento slot → drafters

| Slot | Módulos actuais |
|------|-----------------|
| `bodice` | `draftBlouseFront`, `draftBlouseBack` |
| `sleeve` | `draftSleevePiece` |
| `collar` | `draftCollarStand`, `draftCollarFall` |
| `cuff` | `draftCuff` |
| `placket` | `draftPlacket` |
| `chestPocket` | `draftChestPocket` |
| `sidePocket` | **novo** `draftSidePocket` |
| `skirt` | `draftSkirtFront`, `draftSkirtBack` |
| `pant` | `draftPantFront`, `draftPantBack` |
| `waistband` | `draftWaistband` |

## Validação

- Se slot OFF: peça **não** entra em `pieces`, layout, nem PDF.
- Se slot ON mas drafter devolve `error`: propagar `piece.error` no preview; PDF omite ou avisa.
- Guardrails: ao desligar manga, não validar cap ease; ao ligar, validar.

## Persistência / URL (fase 2)

Query string ou `localStorage`: `?product=blusa&sleeve=1&collar=0` para partilhar composição.
