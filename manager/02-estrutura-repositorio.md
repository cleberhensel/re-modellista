# Estrutura do repositório

Não é monorepo (sem workspaces npm/pnpm/turbo). O único `package.json` npm está em `backend/`. O front declara dependências Bower na raiz.

## Raiz do projeto

| Caminho | Função |
|---------|--------|
| `index.html` | Shell da SPA AngularJS; referencia `assets/`, `bower_components/`, `core/`. |
| `bower.json` | Dependências front-end (Angular, jQuery, Bootstrap, Slick, Contentful, etc.). |
| `contributors.txt` | Metadados de contribuidores. |
| `.gitignore` | Ignora `nbproject/` (NetBeans). |
| `assets/` | CSS compilado/minificado, JS auxiliar (Bootstrap, ngDialog, tooltips, scripts), imagens. |
| `core/` | Código AngularJS (`controllers.js`, `slick-controllers.js`), `basic-blouse.js` (SVG/geometria no browser), `index.js` (**router Express duplicado**, não referenciado por `backend/app.js`). |
| `views/` | Templates HTML consumidos pela SPA (`templateUrl` no Angular). |
| `views/partials/` | Parciais HTML (sliders, SVGs “como medir”, modais). |
| `template/` | Templates de tooltip e modal reutilizáveis pela SPA. |

## Pasta `backend/`

| Caminho | Função |
|---------|--------|
| `app.js` | Aplicação Express: CORS, parsers, estáticos, montagem de routers. |
| `bin/www` | Entrada do processo Node: porta, servidor HTTP. |
| `package.json` | Dependências npm **incompletas** relativamente ao `require()` em `app.js` e rotas. |
| `routes/` | Routers Express: `index.js`, `users.js`, `basic-shirt.js`, `pants.js`, `shirt.js` (último não montado em `app.js`). |
| `views/` | Templates **Jade** para laboratório, layouts, partials de peça, erro, listagem S3. |
| `public/` | Estáticos servidos em `/public`: JS (jQuery, RequireJS, Paper, módulos de molde), CSS, imagens, `template-canvas.html`. |
| `.htaccess` | Configuração Apache (se deploy em Apache). |

## Caminhos relativos importantes

- Em `backend/app.js`, os estáticos `../assets`, `../core`, `../bower_components`, `../views`, `../template` resolvem a partir da pasta **`backend/`**, ou seja, apontam para a **raiz do repositório** (irmãos de `backend/`).

- Em `backend/routes/index.js` (e em `core/index.js`), `sendFile` usa `root: '../application/'` e ficheiro `index.html`. Na árvore atual do repositório **não existe** pasta `application/`; o `index.html` está na raiz. Isto implica que, em deploy, ou existe uma pasta `application` fora do snapshot, ou a rota `GET /` falha no envio do ficheiro até corrigir o caminho.

## Ficheiros de backup / legado

Em `backend/public/javascripts/modules/backup/` existem cópias ou variantes antigas de módulos (`basic-blouse*.js`, `module-basic-blouse.js`, etc.), úteis apenas para histórico ou comparação.
