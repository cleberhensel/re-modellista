# Inventário de módulos e ficheiros

Lista orientativa por pasta (snapshot analisado). Ficheiros binários ou minificados são referidos em grupo.

## Raiz

- `.gitignore`
- `bower.json`
- `contributors.txt`
- `index.html` — SPA shell.

## `assets/`

- `css/`: `bootstrap.min.css`, `styles.css`, `styles.less`, `angular-tooltips.min.css`, `ngDialog.css`, `ngDialog-theme-default.css`.
- `js/`: `scripts.js`, `modernizr.js`, `ngDialog.js`, `velocity.js`, `angular-tooltips.min.js`, `ui-bootstrap-0.13.0.min.js`, `bootstrap.min.js`.
- `img/logo-modelista-01.svg`.

## `core/`

- `controllers.js` — módulo Angular `base`, rotas, Contentful, controllers, directivas.
- `slick-controllers.js` — controllers de sliders Contentful.
- `basic-blouse.js` — parsing/conversão SVG e geometria no cliente.
- `index.js` — router Express autónomo (legado).

## `views/`

- `home.html`, `about.html`, `contact.html`, `products.html`, `model.html`.
- `partials/`: `collections.html`, `como-medir-*.html`, `comoMedirModalTemplate.html`, `infoModalTemplate.html`, `logo-svg.html`, `product.html`, `slider-banner.html`, `slider-products.html`, `slider-pictures.html`, `slider.html`.

## `template/`

- `modal/backdrop.html`, `modal/window.html`.
- `tooltip/tooltip-*.html` (várias variantes popup).

## `backend/`

- `app.js`, `package.json`, `.htaccess`, `npm-debug.log`.
- `bin/www`.

## `backend/routes/`

- `index.js`, `users.js`, `basic-shirt.js`, `pants.js`, `shirt.js`.

## `backend/views/`

- Layouts e partials Jade listados em `04-backend-express.md`.

## `backend/public/`

- `stylesheets/style.css`.
- `images/`, `javascripts/` (jQuery, RequireJS, Paper, módulos, backups).
- `template-canvas.html`.
- Duplicado de logo SVG em `public/images/`.

## Ficheiros HTML na raiz de `views/` (marketing)

Já listados; não confundir com `backend/views` (Jade).

## Contagem aproximada

A árvore indexada pelo workspace tinha **ordem de 100+ ficheiros** no total do projeto; a maior densidade de lógica custom está em `core/controllers.js`, `core/basic-blouse.js`, `backend/routes/index.js` e `backend/public/javascripts/modules/`.
