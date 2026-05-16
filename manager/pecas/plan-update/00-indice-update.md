# Índice — Atualização de algoritmos (produtos completos)

Plano de **correção e completude** do motor Remodellista após implementação inicial (`../plan/`). Foco: o utilizador seleciona um **produto completo** e recebe todas as peças necessárias para montar a peça de vestuário, com geometria validada contra literatura e legado.

## Princípios

| Regra | Descrição |
|-------|-----------|
| Produto completo | Nunca entregar só sub-peça no fluxo principal (ex.: camisa = corpo + manga + colarinho + punho + carcela + bolso) |
| Fórmulas explícitas | Cada TASK lista variáveis, fórmulas alvo e fontes |
| Paridade legado | Onde existir `modelista-completo/core/basic-blouse.js`, validar SVG/pontos-chave |
| Testes | Golden fixtures + `pathLength` + guardrails por produto |

## Tasks por produto

| Ficheiro | Product ID | Escopo completo |
|----------|------------|-----------------|
| [TASK-update-blusa.md](TASK-update-blusa.md) | `blusa` | Frente + costas |
| [TASK-update-camisa.md](TASK-update-camisa.md) | `camisa` | Blusa + manga + colarinho + punho + carcela + bolso |
| [TASK-update-saia-reta.md](TASK-update-saia-reta.md) | `saia-reta` | Saia frente + costas (+ cós opcional no produto) |
| [TASK-update-calca-bermuda.md](TASK-update-calca-bermuda.md) | `calca` / `bermuda` | Calça frente + costas (+ variante bermuda) |
| [TASK-update-vestido.md](TASK-update-vestido.md) | `vestido` | Bodice + saia alinhados (4 peças) |
| [TASK-update-top-sem-mangas.md](TASK-update-top-sem-mangas.md) | `top-sem-mangas` | Corpo sem manga |
| [TASK-update-casaco.md](TASK-update-casaco.md) | `casaco` | Corpo com ease + manga ampliada |
| [TASK-update-malha.md](TASK-update-malha.md) | `malha` | Corpo knit com regras de elasticidade |
| [TASK-update-validacao-e-render.md](TASK-update-validacao-e-render.md) | — | Layout SVG, paridade legado, critérios transversais |

## Plano geral

- [00-plano-geral-update.md](00-plano-geral-update.md) — ondas, dependências, definição de “completo”

## Referências de pesquisa (resumo)

- Winifred Aldrich — *Metric Pattern Cutting* (ease, calça, saia)
- Burda — trouser block PDF (gancho `0,175×W + 15,4`)
- Bunka — proporções `B/24`, bloco proporcional
- BR: [Cortando e Costurando — blusa](https://cortandoecosturando.com/index.php/2023/05/05/molde-basico-blusas/), [Algodão Cru — calça](https://algodaocru.com.br/molde-de-calca-feminina-molde-base)
- Manga: [anicka.design set-in sleeve](https://anicka.design/how-to-draft-a-basic-sleeve-pattern/), cap ease 3,2–4,4 cm

## Documentação relacionada

- Fichas: `../blusa-frente.md`, `../calca.md`, etc.
- Plano original: `../plan/00-plano-geral.md`
- Validação: `../../modelagem/14-validacao-motor-vs-legado.md`
