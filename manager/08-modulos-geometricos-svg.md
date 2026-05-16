# Módulos geométricos e SVG

## Visão geral

A lógica de negócio geométrica está **partida** entre:

1. **Browser (SPA / utilitários):** `core/basic-blouse.js` — grande ficheiro que lê strings SVG, percorre elementos DOM (`polygon`, `path`, `line`, etc.) e constrói estruturas para desenho ou exportação (integração com Underscore para iterações).

2. **Browser (laboratório):** módulos AMD em `backend/public/javascripts/modules/**` usando **Paper.js** para construir moldes paramétricos a partir de medidas injectadas nas views Jade.

3. **Servidor:** geração de PDF com **PDFKit** em `backend/routes/index.js` (e routers de camisa/calça), traçando linhas/polígonos a partir de dados POST (SVG serializado em JSON).

## Convenções de parâmetros

Parâmetros de medida repetidos em rotas e controladores:

- `width` — largura/peito (contexto de peça).
- `heigth` — altura (typo consistente no código).
- `c_width` — largura de cintura ou medida central (varia por peça).
- `f_width` — frente / braço conforme rota.
- `l_sleeve` — comprimento de manga.
- Em calças: rotas simplificadas `pnts/:width/:height/`.

## Peças modeladas

| Peça | Rotas / módulos |
|------|-----------------|
| Blusa básica (variante 2) | `GET /:width/:heigth/:c_width` → módulo `basic-blouse-2` |
| Blusa básica | `basic_blouse/...`, `h/...` → `basic-blouse` |
| Camisa | `/basic-shirt/...`, ficheiro `shirt.js` (não montado) |
| Calças | `/pants/pnts/...` |

## Ficheiros de suporte na raiz `core/`

- **`slick-controllers.js`:** apenas dados CMS para sliders (não geometria).
- **`controllers.js`:** Angular + construção de URL para laboratório legado.
- **`index.js`:** router Express duplicado (geometria servidor + mysql + phantom).

## Fluxo PDF a partir de SVG

O POST `/create-pdf-svg/` (e homólogos em `basic-shirt.js` / `pants.js`) recebe corpo JSON com representação de caminhos SVG, usa PDFKit para desenhar contornos (incluindo estilos tracejados mencionados na análise), e envia PDF para S3.

## Ficheiros SVG estáticos

`views/partials/` contém vários SVGs (instruções “como medir”, ilustrações). São incluídos via `ng-include` ou parciais nas modais (`comoMedirModalTemplate`, etc.).

## Risco de duplicação

A mesma ideia de “converter SVG para PDF” aparece em múltiplos routers — manutenção e bugs podem divergir entre `index.js`, `basic-shirt.js`, `pants.js` e `shirt.js`.
