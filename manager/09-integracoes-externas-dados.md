# Integrações externas e dados

## Contentful (CMS headless)

- **Consumidor:** Angular (`angular-contentful`).
- **Configuração:** `contentfulProvider.setOptions` em `core/controllers.js` (space id e access token **em código cliente**).
- **Content types referenciados por ID:**
  - `4CfF9vVgbKY2oA0UKeAygA` — banners (`bannerSliderController`).
  - `5yRBJLYZFe2y48YCuOOEiO` — produtos (`productsSliderController`, `views/partials/product.html`).
  - `5uyP0fcDuwkcoymuO2gass` — coleções (`collectionsController`).
  - `4bQ6Fk9GFywcMiQIg6I4Yw` — about (`views/about.html` via `contentful-entries`).
- **Entrada individual:** `contentful.entry($scope.id)` no `modelController` para detalhe do modelo.

## MySQL

- **Driver:** pacote npm `mysql`.
- **Configuração:** `mysql.createConnection({ host, user, password, database })` inline em `backend/routes/index.js` e `core/index.js` (valores sensíveis — não reproduzidos aqui).
- **Base referenciada:** nome contém `modellista_desenv` (grafia do código).
- **Tabelas inferidas:** `contact` (colunas mapeadas a partir de query string no GET `/contact`); referências a `products` e `db.find_all_products` em código alargado dos routers (padrão legado).

## Amazon S3

- **SDK:** `aws-sdk`.
- **Bucket:** `modellista-desev` (nome fixo no código — possível typo de “desenv”).
- **Operações:** `listObjects` na rota `/list-bucket/`; uploads de PDF nos fluxos POST de criação de PDF.

## HTTP legado / outros hosts

Strings hardcoded observadas:

- `http://dev.simstim.com.br:3000/...` — formulários de teste e geração PDF.
- `http://dev.simstim.com.br/modellista/backend/basic-shirt/...` — abertura do laboratório a partir do `modelController`.
- `http://modellista.com.br/` — redirect após contacto.
- `http://54.207.102.51/couturelab/lab/paperjs/` — base em `main.js` (RequireJS).

Estes hosts tornam o projeto **dependente de infraestrutura externa** e difícil de reproduzir sem mocks.

## Phantom e renderização servidor

Comentários e requires a `phantom` sugerem pipeline antigo: renderizar página HTML e capturar para PDF. Não está garantido que funcione em ambiente Node atual.

## Rsvg

`require('rsvg')` em `core/index.js` — extensão nativa Node (librsvg). Instalação frágil em macOS/Windows; típico de Linux com pacotes de sistema.

## AWS credentials

O código usa `new AWS.S3()` sem bloco explícito nesta análise — assume **variáveis de ambiente padrão AWS**, ficheiro `~/.aws/credentials`, ou **role IAM** em EC2. Confirmar no restante de `routes/index.js` se há `AWS.config.update` com chaves (não pesquisado byte a byte nesta sessão).
