# Stack tecnológica

## Runtime e servidor

- **Node.js** (versão não fixada no repositório).
- **Express** `~4.13.0` (`backend/package.json`, `backend/app.js`).
- **Motor de views:** Jade `~1.11.0` (`app.set('view engine', 'jade')`).

## Middleware e utilitários Express (declarados em `package.json`)

- `body-parser`, `cookie-parser`, `morgan`, `debug`, `serve-favicon`.

## Pacotes usados no código mas ausentes de `backend/package.json`

O `app.js` e as rotas fazem `require` de pacotes **não listados** no `package.json` atual. Para instalação limpa seria necessário alinhar dependências:

| Pacote | Onde surge |
|--------|------------|
| `multer` | `backend/app.js`, routers |
| `aws-sdk` | `backend/app.js`, `routes/index.js`, `core/index.js` |
| `underscore` | `backend/app.js`, rotas, scripts públicos |
| `pdfkit` | `backend/app.js`, rotas |
| `mysql` | `backend/routes/index.js`, `core/index.js` |
| `phantom` | `core/index.js`, comentários/fluxos em rotas |
| `request` | referências em rotas para HTTP outbound (PDF legado) |
| `rsvg` (`require('rsvg')`) | `core/index.js` |

Isto indica projeto **antigo** ou `package.json` **desatualizado** face ao código.

## Front-end (Bower — `bower.json`)

- **AngularJS** `~1.3.15` com `angular-route`, `angular-animate`.
- **angular-contentful** `2.0.0`.
- **angular-slick** / **angular-slick-carousel**, **slick-carousel**.
- **jQuery** `2.1.1`, **Bootstrap** `~3.1.1`, **underscore** `~1.8.3`.
- **angular-input-masks**, **string-mask**, **br-validations** (declarados; nem todos aparecem carregados no `index.html`).

## Front-end (carregamento direto / CDN no `index.html`)

- Font Awesome (CDN).
- Google Fonts (HTTP).
- Slick CSS (jsDelivr CDN).
- Plugins em `assets/js/`: Modernizr, Velocity, ngDialog, angular-tooltips, ui-bootstrap, Vivus (referências no HTML conforme trecho analisado).

## Laboratório (RequireJS + Paper)

- **RequireJS** (`backend/public/javascripts/main.js`, `require.js`, `domReady.js`).
- **Paper.js** (`paper.js`, `paper-core.js`, path `paper-full` no `main.js`).
- **jQuery** e **Underscore** duplicados na pasta `public/javascripts/` (cópias locais para o bundle AMD).

## Estilos

- **Bootstrap 3** minificado em `assets/css/`.
- **LESS** `assets/css/styles.less` (compilação não automatizada no repositório).
- **CSS** gerado/proprio `assets/css/styles.css`.

## Base de dados e cloud

- **MySQL** via driver `mysql` (sem ORM).
- **AWS S3** via `aws-sdk`.

## CMS

- **Contentful** (REST API consumida pelo cliente Angular através de `angular-contentful`).

## O que não existe neste snapshot

- Docker, Makefile, CI configs visíveis, testes automatizados, bundler moderno (Webpack/Vite), TypeScript, GraphQL, Prisma/Sequelize, ficheiros `.env` versionados.
