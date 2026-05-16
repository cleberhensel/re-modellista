# Inventário de código de modelagem

## Ficheiros nucleares (ler primeiro)

| Caminho | Linhas ~ | Função |
|---------|----------|--------|
| `backend/public/javascripts/modules/basic-blouse.js` | 1030 | Implementação completa blusa + manga + SVG |
| `core/basic-blouse.js` | 905 | Duplicata + POST PDF |
| `backend/public/javascripts/modules/basic-blouse-2.js` | 557 | Variante 3 parâmetros + debug |
| `backend/public/javascripts/modules/module-basic-blouse.js` | 618 | AMD protótipo |
| `backend/public/javascripts/modules/basic-shirt/basic-shirt-front.js` | 123 | Frente camisa (paperscript) |
| `backend/public/javascripts/modules/basic-shirt/basic-shirt-back.js` | 110+ | Costas camisa |
| `backend/public/javascripts/modules/pants/pants-front.js` | 91 | Grelha calças |

## Suporte Paper / loader

| Caminho | Função |
|---------|--------|
| `backend/public/javascripts/paper.js` | Paper.js bundle |
| `backend/public/javascripts/main.js` | RequireJS config (módulo blusa comentado) |
| `backend/public/javascripts/domReady.js` | Plugin AMD |
| `backend/public/javascripts/simulate.js` | Simulação (não analisado em profundidade) |

## Views e layouts

| Caminho | Função |
|---------|--------|
| `backend/views/layout-2.jade` | `config` + script `modules/#{module}.js` |
| `backend/views/layout-basic.jade` | Idem para camisa |
| `backend/views/partials/index-2.jade` | 3 canvas blusa |
| `backend/views/partials/basic-shirt.jade` | paperscript por canvas |
| `backend/views/partials/pants.jade` | canvas calças |
| `backend/views/layout/layout-pants.jade` | layout calças |

## Rotas HTTP

| Caminho | Função |
|---------|--------|
| `backend/routes/index.js` | Rotas blusa, `create-pdf-svg`, list-bucket |
| `backend/routes/basic-shirt.js` | GET camisa + PDF |
| `backend/routes/pants.js` | GET calças + PDF |
| `backend/routes/shirt.js` | Não montado |

## Frontend entrada utilizador

| Caminho | Função |
|---------|--------|
| `views/model.html` | Formulário medidas |
| `core/controllers.js` | `modelController`, URL laboratório |
| `views/partials/como-medir-*.html` | SVGs ajuda medição (estáticos) |

## Funções `drawer` — mapa rápido

| Função | Categoria |
|--------|-----------|
| `config` | Entrada parâmetros |
| `getBustWidth`, `getHipWidth`, `seventh_table`, `seventh`, `seventhPx` | Matemática base |
| `getWidthPx`, `getHeightPx`, `getHipPx`, `oneCmInPx` | Escala |
| `startPoint`, `baseRectangleFront`, `rectangleRight*` | Layout |
| `collarCircle`, `lineCenter`, `shoulder`, `virtualDivision` | Construção |
| `armhole`, `armholeBack` | Cava |
| `rightSide`, `*Pence` | Pences / lateral |
| `basicBlouseFront`, `basicBlouseBack` | Montagem frente/costas |
| `sleeve`, `widthFist`, `addHandles` | Manga |
| `translateSvg.load` | Pós-processamento |
| `createFile` | AJAX PDF |

## Dependências runtime

- jQuery (DOM, AJAX)
- Underscore (`_.each` no SVG e PDF)
- Paper.js (geometria)
- Opcional: RequireJS (não ativo no fluxo principal atual)
