# Catálogo de peças — índice

Ficha detalhada por peça (medidas, construção, matemática, derivações, estado no Modellista).

## Peças do núcleo superior (implementadas ou parciais)

| Ficheiro | Peça | Modellista | Remodellista |
|----------|------|------------|--------------|
| [blusa-frente.md](blusa-frente.md) | Blusa / bodice — frente | Implementado | Implementado |
| [blusa-costas.md](blusa-costas.md) | Blusa / bodice — costas | Implementado | Implementado |
| [manga.md](manga.md) | Manga set-in | Implementado | Implementado |
| [camisa.md](camisa.md) | Camisa (fluxo + elementos) | Parcial (bodice) | Implementado |

## Peças inferiores e corpo inteiro

| Ficheiro | Peça | Modellista | Remodellista |
|----------|------|------------|--------------|
| [saia-reta.md](saia-reta.md) | Saia reta (bloco) | Não | Implementado |
| [calca.md](calca.md) | Calça (bloco) | Protótipo | Implementado |
| [vestido.md](vestido.md) | Vestido (união blusa + saia) | Não | Implementado |

## Variantes e especializações

| Ficheiro | Peça | Modellista | Remodellista |
|----------|------|------------|--------------|
| [top-sem-mangas.md](top-sem-mangas.md) | Top / blusa sem mangas | Não | Implementado |
| [casaco-blazer.md](casaco-blazer.md) | Casaco / blazer | Não | Implementado |
| [malha-knit.md](malha-knit.md) | Malha / knit block | Não | Implementado |

## Complementos de modelagem

| Ficheiro | Conteúdo |
|----------|----------|
| [complementares.md](complementares.md) | Gola, punho, cós, bainha, bolso |

## Código do motor

Projeto autocontido: `remodellista/` (raiz do repositório irmão). Comandos: `npm run dev`, `npm test`, `npm run test:coverage`.

## Planeamento de implementação (motor TypeScript)

| Documento | Conteúdo |
|-----------|----------|
| [plan/00-plano-geral.md](plan/00-plano-geral.md) | Arquitetura, ondas, testes 100%, seletor de peça |
| [plan/TASK-front-seletor-pecas.md](plan/TASK-front-seletor-pecas.md) | UI: trocar peça modelada |
| [plan/TASK-blusa.md](plan/TASK-blusa.md) | Peça completa frente + costas |
| [plan/TASK-manga.md](plan/TASK-manga.md) | Manga set-in |
| [plan/TASK-camisa.md](plan/TASK-camisa.md) | Produto blusa + manga |
| [plan/TASK-saia-reta.md](plan/TASK-saia-reta.md) | Saia reta |
| [plan/TASK-calca.md](plan/TASK-calca.md) | Calça frente + costas |
| [plan/TASK-vestido.md](plan/TASK-vestido.md) | Bodice + saia alinhados |
| [plan/TASK-top-sem-mangas.md](plan/TASK-top-sem-mangas.md) | Variante cava sem manga |
| [plan/TASK-complementares.md](plan/TASK-complementares.md) | Colarinho, punho, cós, etc. |
| [plan/TASK-malha-knit.md](plan/TASK-malha-knit.md) | Perfil malha |
| [plan/TASK-casaco-blazer.md](plan/TASK-casaco-blazer.md) | Casaco / blazer |

## Documentação relacionada

- Implementação código: [../modelagem/](../modelagem/)
- Arquitetura produto: [../13-arquitetura-ddd-e-planeamento-migracao.md](../13-arquitetura-ddd-e-planeamento-migracao.md)
