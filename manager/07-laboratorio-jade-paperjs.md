# Laboratório Jade, canvas e Paper.js

## Finalidade

Fluxo separado da SPA de marketing: páginas geradas no **servidor** com **Jade**, que carregam scripts AMD (**RequireJS**) para desenhar moldes com **Paper.js** no browser, com medidas injetadas via query da rota Express.

## Ponto de entrada RequireJS

- `backend/public/javascripts/main.js` define `require.config` com `baseUrl: '/public/javascripts/'`, paths `jquery`, `underscore`, `paper` (`paper-full`), `domReady`.
- Exemplo de `define` no mesmo ficheiro: módulo `modules/basic-blouse` — muitas linhas estão comentadas (código de teste).
- Variável `absolute_path` aponta para host externo `http://54.207.102.51/couturelab/lab/paperjs/` (recursos ou API legada).

## Módulos de desenho (`backend/public/javascripts/modules/`)

Estrutura observada:

- **`shirt/`:** `shirt.js`, `shirt-front.js`, `shirt-back.js`, `shirt-sleeve.js`.
- **`basic-shirt/`:** `basic-shirt.js`, `basic-shirt-front.js`, `basic-shirt-back.js`, `basic-shirt-sleeve.js`.
- **`pants/`:** `pants.js`, `pants-front.js`.
- **`basic-blouse.js`**, **`basic-blouse-2.js`** na raiz de `modules/`.
- **`backup/`:** versões antigas de blusa e módulos.

Cada módulo encapsula geometria 2D (Paper.js) para frente/costas/manga conforme o tipo de peça.

## Templates HTML no público

- `backend/public/template-canvas.html` — página auxiliar de canvas (referência em árvore de ficheiros).

## Jade e layouts

As rotas `GET` com medidas chamam `res.render('partials/index-2', data)` com campos:

- `title`, `token`, `width`, `heigth`, `c_width`, opcionalmente `f_width`, `l_sleeve`.
- `module`: string que identifica o bundle RequireJS (ex. `basic-blouse`, `basic-blouse-2`).
- `layout`: ficheiro de layout Jade (ex. `layout-2`).

Os partials Jade (`backend/views/partials/index-2.jade`, etc.) ligam os scripts e passam variáveis ao cliente.

## Relação com `core/basic-blouse.js`

Este ficheiro na pasta **`core/`** (servido como estático em `/core/basic-blouse.js` se referenciado) implementa **parsing de SVG no DOM** (polygons, paths, lines) e lógica de `translateSvg` — é usado no contexto do **site Angular** ou fluxos híbridos, não necessariamente pelo mesmo entry que `main.js` do backend. Funciona com **Underscore** no browser.

## Dependências nativas legadas

`core/index.js` referencia `phantom` e `rsvg` para rasterização/PDF em contexto servidor — binários e pacotes nativos difíceis de instalar em Node moderno.

## Resumo

| Camada | Tecnologia |
|--------|------------|
| Servidor | Express + Jade |
| Cliente laboratório | RequireJS + jQuery + Underscore + Paper.js |
| Cliente site | AngularJS + SVG/Vivus + `core/basic-blouse.js` |
