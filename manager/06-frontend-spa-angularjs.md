# Frontend SPA (AngularJS)

## Módulo e arranque

- Ficheiro principal: `core/controllers.js`.
- Módulo Angular: **`base`** (declarado em `angular.module('base', [...])`).
- `index.html` usa `ng-app="base"` na maioria dos ramos HTML; num comentário condicional IE aparece `ng-app="myApp"` — inconsistência cosmética; o código registado é **`base`**.

## Dependências injectadas no módulo

`ngRoute`, `contentful`, `ngAnimate`, `slick`, `720kb.tooltips`, `ngDialog`.

## Configuração Contentful

Em `main.config`, `contentfulProvider.setOptions({ space, accessToken })` — **credenciais em cliente** (token visível no browser). Localização: início de `core/controllers.js`. Não duplicar o token nesta documentação.

## Rotas (`$routeProvider`)

| Path Angular | `templateUrl` | `controller` |
|--------------|---------------|--------------|
| `/` | `views/home.html` | `homeController` |
| `/about` | `views/about.html` | `aboutController` |
| `/contact` | `views/contact.html` | `contactController` |
| `/products` | `views/products.html` | `productsController` |
| `/collections` | `views/partials/collections.html` | `collectionsController` |
| `/model/:id` | `views/model.html` | `modelController` |

Navegação no header usa **hash** (`#/`, `#/products`, …).

## Ficheiro `core/slick-controllers.js`

Controllers dedicados a sliders com dados Contentful:

- **`bannerSliderController`:** `contentful.entries('content_type=4CfF9vVgbKY2oA0UKeAygA')` → itens do carrossel topo.
- **`productsSliderController`:** `content_type=5yRBJLYZFe2y48YCuOOEiO` — alinhado com `views/partials/product.html` que usa a mesma query via directiva declarativa.

Outros sliders (imagens, etc.) seguem o mesmo padrão de promessa `.then()`.

## Controllers principais (comportamento)

- **`homeController` / `productsController`:** ativam menu ativo e visibilidade de header/footer via funções globais (definidas em `assets/js/scripts.js` — manipulação jQuery).
- **`modelController`:** carrega entrada Contentful por `id` da rota; ao submeter medidas (`$scope.update`), anima SVG com **Vivus** e abre nova janela (ou link em mobile) para URL legada:

  `http://dev.simstim.com.br/modellista/backend/basic-shirt/{width}/{height}/{c_width}/{l_sleeve}/{f_width}/`

  A ordem dos segmentos na string concatena `l_sleeve` antes de `f_width` face aos nomes do objeto `req` — validar se corresponde ao contrato real do servidor legado.

  Bloco `$http` para gerar molde está **comentado**; o fluxo ativo é só `window.open` / `href`.

- **`contactController`:** `POST` para **`url: '#'`** — não envia para o backend Express real; o fluxo funcional de contacto no servidor é `GET /contact` com query (ver rotas). O formulário Angular está **desalinhado** da API.

- **`footerController`:** newsletter com `POST` para string literal **`trocarURL`** — placeholder.

- **`collectionsController`:** obtém tipo `5uyP0fcDuwkcoymuO2gass`, percorre `fields.products` e achata referências para `collections`.

- **`aboutController`:** chama `load_data` que faz `contentful.entries()` sem filtro (lista ampla de entries).

## Directivas custom

- **`logo`:** inclui `views/partials/logo-svg.html`.
- **`slider`:** `templateUrl` dinâmico `views/partials/slider-{type}.html` conforme atributo `type` no elemento (ex. `type='banner'`).
- **`infobox`:** template do modal de informação.
- **`controlsTooltip`:** copia atributos avaliados para o elemento e recompila (integração com tooltips).

## Modais e UI

- **ngDialog:** `modalOpenerController`, `infoModalTemplateController`, `comoMedirModalTemplateController` — abrem/fecham com classes CSS e jQuery.
- **Tooltips:** `720kb.tooltips` + atributos dinâmicos.

## Templates HTML relevantes (`views/`)

- `home.html`, `about.html`, `contact.html`, `products.html`, `model.html`.
- Parciais em `views/partials/`: sliders (`slider-banner`, `slider-products`, `slider-pictures`), `collections.html`, SVGs de medidas (`como-medir-*`), `product.html` (Contentful directive), modais, logo.

## Internacionalização

Não há `angular-translate` nem ficheiros de locale. Textos em português embutidos nos HTML.

## Estilos e layout

- Bootstrap 3, `styles.css`, temas ngDialog e tooltips, Slick via CDN.

## Mistura jQuery + Angular

`assets/js/scripts.js` controla menu, classes de corpo, `showHeaderAndFooter`, etc. Isto acopla o ciclo de vida Angular ao DOM global.
