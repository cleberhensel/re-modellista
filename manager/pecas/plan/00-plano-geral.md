# Plano geral — motor de peças (Remodellista)

Documento mestre derivado de [../00-indice.md](../00-indice.md) e fichas em `manager/pecas/`. Estado de referência: `remodellista/` (autocontido).

## Objetivo

Implementar todas as peças catalogadas no motor TypeScript (`remodellista/engine/`), com **peça completa** como unidade de produto, **seletor de peça no front**, **guardrails por peça**, e **100% de cobertura de testes** em `remodellista/`.

## Isolamento total do legado

O protótipo **não importa, não valida e não referencia** `backend/`, `core/` nem scripts de paridade.

| Regra | Detalhe |
|-------|---------|
| Zero dependência runtime | Nenhum `import` fora de `remodellista/` |
| Zero paridade | Sem `validate-parity`, sem diff com Paper.js legado |
| Regras próprias | Constantes e algoritmos em `engine/constants.ts`, `engine/seventh.ts`, etc. |
| Fichas `manager/pecas/` | Apenas documentação de domínio; ao implementar, **portar** fórmulas para TS e testar no motor |
| Referência histórica | `manager/modelagem/` descreve o sistema antigo; não é contrato do protótipo |

### O que vive só no protótipo

| Conceito | Onde |
|----------|------|
| Escala px/cm | `DEFAULT_PX_PER_CM`, `DEFAULT_MARGIN_CM` |
| Regra do sétimo | `seventhFromBustCm` + `SEVENTH_HEAD_DIGITS` |
| Blusa frente | `pieces/blouse-front.ts` |
| Cava frente | `armhole.ts` |
| Guardrails | `guardrails/*` |
| SVG | `render/svg.ts` |
| UI | `app.ts`, `index.html` |

### Ao implementar nova peça (ex. costas, manga)

1. Ler ficha em `manager/pecas/*.md` como especificação de domínio.
2. Escrever `pieces/*.ts` + testes com valores esperados **fixos no teste** (golden cases).
3. Não criar script que leia `basic-blouse.js`.

## Princípio: peça completa vs sub-peça

| Conceito | ID exemplo | O que inclui | Expõe no UI |
|----------|------------|--------------|-------------|
| **Sub-peça** | `blouse-front` | Meio-frente, paths SVG | Não (interno) |
| **Sub-peça** | `blouse-back` | Meio-costas | Não |
| **Peça completa** | `blusa` | `blouse-front` + `blouse-back` | Sim |
| **Peça completa** | `manga` | Cabeça + punho (1 molde) | Sim |
| **Produto composto** | `camisa` | `blusa` + `manga` + (futuro colarinho) | Sim |
| **Peça completa** | `saia-reta` | Frente + costas (quartos) | Sim |
| **Peça completa** | `calca` | Frente + costas | Sim |
| **Produto composto** | `vestido` | `blusa` (até cintura) + `saia-reta` | Sim |

Regra: **nunca** expor só “frente” ou só “costas” no seletor principal.

## Arquitetura alvo do motor

```
remodellista/
  catalog/products.ts         # metadados UI (labels, campos)
  engine/
    constants.ts, seventh.ts, geometry.ts, context.ts
    armhole.ts, armhole-back.ts (novo)
    pieces/
    products/
    guardrails/
    registry.ts
  render/svg.ts
  app.ts
```

### Contrato `draft()` evoluído

```ts
interface DraftOptions {
  productId: string;
  pxPerCm?: number;
  marginCm?: number;
}

interface DraftResult {
  productId: string;
  ctx: DraftContext;
  pieces: PatternPiece[];
  bounds: DraftBounds;
  meta?: Record<string, number>;
}
```

## Padrões obrigatórios

1. Código em inglês; UI em pt-BR.
2. Sem comentários no código.
3. TDD: `*.test.ts` junto ao módulo.
4. Escala: `DEFAULT_PX_PER_CM`, `startOne`, `startTwo`.
5. Sétimo: única função `seventhFromBustCm(bust)` (truncagem `SEVENTH_HEAD_DIGITS`).
6. Guardrails: checks + `resolve(changedKey)`.
7. Validação: **apenas** Vitest + coverage 100%; fixtures em `engine/fixtures/` se necessário.
8. SVG: `pieceToSvgPath` com `M` entre segmentos desconectados.

## Cobertura de testes — 100%

`npm run test:coverage` em `remodellista/` — thresholds 100% em `engine/**`, `render/**`, `catalog/**`, `app.ts`.

Golden tests exemplo:

```ts
it("default blouse front dart center", () => {
  const ctx = buildContext({ bust: 92, height: 45, waist: 81, ... });
  const piece = draftBlouseFront(ctx);
  expect(piece.points?.dartCenterX).toBeCloseTo(expected, 2);
});
```

## Ordem de implementação (ondas)

### Onda 1

| # | Task |
|---|------|
| 1 | [TASK-front-seletor-pecas.md](TASK-front-seletor-pecas.md) |
| 2 | [TASK-blusa.md](TASK-blusa.md) |
| 3 | [TASK-manga.md](TASK-manga.md) |
| 4 | [TASK-camisa.md](TASK-camisa.md) |

### Onda 2–4

Saia, calça, vestido, top, complementares, malha, casaco — ver índice em [../00-indice.md](../00-indice.md).

## Entregáveis por task

1. Escopo + ficha de domínio
2. Pré-requisitos
3. Ficheiros e fórmulas portadas para TS
4. Lista de testes `it(...)` com valores esperados no próprio teste
5. Critérios de aceite
6. Guardrails

## Atualizar após cada onda

- [../00-indice.md](../00-indice.md) — coluna Modellista (protótipo)
- Fichas `manager/pecas/*.md` — estado “Implementado no protótipo”

## Referências (domínio apenas)

- [../blusa-frente.md](../blusa-frente.md), [../blusa-costas.md](../blusa-costas.md)
- [../../modelagem/04-construcao-blusa-basica.md](../../modelagem/04-construcao-blusa-basica.md)
