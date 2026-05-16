# Inconsistências, riscos e notas para migração

## Mapeamento de medidas (crítico)

1. **SPA `modelController`:** troca provável de `f_width` ↔ `l_sleeve` na URL vs labels do formulário (manga/punho).
2. **Typo `heigth`:** em todo o stack (rotas, config, PDF legado).
3. **`basic-shirt` route** usa param `height` mas template grava `heigth`.

## Constantes de escala divergentes

| Valor | Onde |
|-------|------|
| 28.347 px/cm | Produção blusa/calças |
| 35.379 px/cm | `module-basic-blouse` |
| 0.0353 cm/px | InD |
| 0.02645833333333 | “internet” no AMD |

Sem unificação, **paridade visual** entre módulos falha.

## Bugs de implementação

- `getHipPx` em `basic-blouse-2` / `core`: `this.getHipWidth.four` sem `()` — deveria ser `getHipWidth().four`.
- `seventh_table` truncamento por string — comportamento não documentado em manuais de modelagem.
- `POST /create-file/` incompleto em `routes/index.js`.
- PDF calças pede 3 SVGs sem gerar costas/manga.

## Duplicação de manutenção

Mesma lógica em ≥4 ficheiros (`basic-blouse`, `core/basic-blouse`, `basic-shirt/*`, backups). Qualquer correção de fórmula de cava exige sincronização manual.

## Segurança e operação

- Rotas de PDF sem autenticação — abuso de CPU/S3.
- Credenciais MySQL em `routes/index.js` (fora do âmbito geometria, mas no mesmo router).
- Hosts hardcoded `dev.simstim.com.br`.

## Código morto / comentado

- Grande bloco comentado em `basic-shirt.js` (implementação monolítica anterior).
- `main.js` RequireJS sem invocação ativa.
- `routes/shirt.js` não montado.
- `drawer.createFile` comentado no lab `basic-blouse.js` arranque.

## Recomendações para extrair domínio (DDD)

1. **Value objects:** `Measurements(width, height, waist, wrist, sleeveLength)`, `SeventhGrid`, `PxScale`.
2. **Domain service:** `BlousePatternDraftingService` com métodos `draftFront()`, `draftBack()`, `draftSleeve(armholeLength)`.
3. **Port:** `PatternRenderer` (Paper → path DTOs); `PatternPdfExporter`.
4. **Testes golden:** medidas fixas (ex. 92/45/81/27/12) comparando comprimento de cava e bbox SVG.

## O que preservar obrigatoriamente na migração

- Regra dos sétimos com truncamento atual (ou decisão explícita de corrigir).
- Relação `sleeve width = armhole.path.length`.
- Fórmulas de `armhole` / `armholeBack` e ordem de `addHandles`.
- Semântica de linhas tracejadas = margem de costura no PDF.
- Contrato JSON `break_svg` + token `DASH` se o pipeline PDF for mantido.
