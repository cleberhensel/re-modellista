# Índice — Peças completas configuráveis

Evolução do motor: cada **produto** (`blusa`, `camisa`, `casaco`, …) deixa de ser um molde fixo e passa a ser uma **receita** de partes opcionais/obrigatórias, com UI e PDF alinhados à composição escolhida.

Relacionado com:
- Correção geométrica: [../plan-update/00-indice-update.md](../plan-update/00-indice-update.md)
- Fichas de domínio: [../00-indice.md](../00-indice.md)
- Plano original: [../plan/00-plano-geral.md](../plan/00-plano-geral.md)

## Princípios

| Regra | Descrição |
|-------|-----------|
| Produto = receita | O `productId` define slots de partes e defaults (ex.: camisa → colarinho + carcela ON) |
| Partes reutilizáveis | Uma implementação por `PatternPiece.id`; vários produtos montam subsets |
| Opções explícitas | `DraftOptions` + UI; sem “sempre 8 peças” se o utilizador desligou bolso |
| Presets | Camiseta, colete, jaqueta = presets sobre a mesma base de bodice |
| Partes isoladas | `kind: "part"` no catálogo mantém-se só para debug |

## Plano geral

| Ficheiro | Conteúdo |
|----------|----------|
| [00-plano-geral.md](00-plano-geral.md) | Ondas, dependências, matriz produto × partes |
| [00-modelo-composicao.md](00-modelo-composicao.md) | Tipos `GarmentRecipe`, slots, validação |

## Onda 0 — Fundação (bloqueante)

| Task | Escopo |
|------|--------|
| [TASK-composicao-motor.md](TASK-composicao-motor.md) | `composeGarment()`, registry de partes, filtros |
| [TASK-opcoes-e-catalogo.md](TASK-opcoes-e-catalogo.md) | `DraftOptions`, `ProductDefinition.recipe`, guardrails |
| [TASK-ui-configurador.md](TASK-ui-configurador.md) | Painel “Composição” no front (toggles + presets) |

## Onda 1 — Corpo superior

| Task | Product ID | Partes configuráveis |
|------|------------|----------------------|
| [TASK-blusa-completa.md](TASK-blusa-completa.md) | `blusa` | Corpo; manga (off / curta / ¾ / longa); gola; bolso peito |
| [TASK-camisa-completa.md](TASK-camisa-completa.md) | `camisa` | Preset camisa: corpo + manga longa + colarinho + punho + carcela + bolso |
| [TASK-camisetas-top-completa.md](TASK-camisetas-top-completa.md) | `top-sem-mangas`, variantes | Camiseta manga curta; top sem mangas; sem colarinho |
| [TASK-colete-completo.md](TASK-colete-completo.md) | novo `colete` | Corpo sem manga; cava profunda; sem colarinho; bolso peito opcional |
| [TASK-malha-completa.md](TASK-malha-completa.md) | `malha` | Corpo knit; manga opcional; sem pences; ease tecido |

## Onda 2 — Exteriores

| Task | Product ID | Partes configuráveis |
|------|------------|----------------------|
| [TASK-jaqueta-casaco-completa.md](TASK-jaqueta-casaco-completa.md) | `casaco` (+ futuro `jaqueta`) | Corpo + ease; manga **sempre longa**; colarinho/lapela; bolso peito + **lateral** |

## Onda 3 — Inferiores

| Task | Product ID | Partes configuráveis |
|------|------------|----------------------|
| [TASK-saia-completa.md](TASK-saia-completa.md) | `saia-reta` | Frente + costas; cós opcional; fenda opcional (fase 2) |
| [TASK-calca-bermuda-completa.md](TASK-calca-bermuda-completa.md) | `calca`, `bermuda` | Frente + costas; cós; bolso opcional; gancho (bermuda = comprimento) |

## Onda 4 — Compostos

| Task | Product ID | Partes configuráveis |
|------|------------|----------------------|
| [TASK-vestido-completo.md](TASK-vestido-completo.md) | `vestido` | Bodice (herda opções blusa) + saia + manga opcional |

## Partes novas / transversais

| Task | Escopo |
|------|--------|
| [TASK-parte-bolso-lateral.md](TASK-parte-bolso-lateral.md) | Bolso aplicado (jaquetas) |
| [TASK-parte-golas-variantes.md](TASK-parte-golas-variantes.md) | Enum tipo de gola (fase 2: Peter Pan, militar) |
| [TASK-layout-pdf-composicao.md](TASK-layout-pdf-composicao.md) | SVG/PDF só com partes activas; ordem por receita |

## Estado actual vs alvo (resumo)

| Produto | Hoje | Alvo |
|---------|------|------|
| `blusa` | Só frente + costas | + opções manga / gola / bolso |
| `camisa` | 8 peças fixas | Preset; toggles por complemento |
| `top-sem-mangas` | `sleeveless: true` fixo | Preset sem manga; variantes |
| `casaco` | Corpo + manga 1.08× | + colarinho opcional; bolso lateral; manga longa obrigatória |
| `malha` | Corpo knit | + manga opcional |
| `saia-reta` | Saia + `includeWaistband` flag | UI cós; fenda fase 2 |
| `calca` / `bermuda` | Só pernas | + cós; bolsos opcionais |
| `vestido` | 4 peças fixas | Herda composição do bodice + saia |
