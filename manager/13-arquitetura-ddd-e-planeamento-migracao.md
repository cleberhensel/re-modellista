# Arquitetura, DDD e planeamento de migração (Angular alvo + Express atual)

Este ficheiro complementa o índice em [00-indice.md](00-indice.md). Resume o papel da pasta `manager/`, a separação front/back, o **núcleo funcional** visto como domínio, e o que é necessário para uma modernização **completa** sem misturar detalhes já cobertos linha a linha noutros documentos.

## O que é a pasta `manager/`

A pasta `manager/` **não é código executável**. É **documentação de engenharia reversa** do repositório `modelista-completo`: inventário de rotas, stack, integrações, anomalias e riscos. Serve como mapa mental antes de refatorar ou migrar.

Para detalhe operacional (rotas, ficheiros, hosts), use os ficheiros numerados `01`–`12`. Este ficheiro `13` concentra-se em **arquitetura**, **DDD** e **estratégia de migração**.

## Visão de arquitetura atual (duas superfícies)

O produto combina **marketing/catálogo** com **ferramenta de moldes paramétricos**. Tecnicamente isso aparece como:

| Superfície | Tecnologia | Onde vive | Entrega ao browser |
|------------|------------|-----------|---------------------|
| Site (SPA) | AngularJS 1.x, Bower, templates HTML em `views/` | Raiz: `index.html`, `core/controllers.js`, `assets/` | Páginas hash (`#/products`, `#/model/:id`, …), dados via Contentful no cliente |
| Laboratório / PDF / armazenamento | Express 4.13, Jade, RequireJS, Paper.js, PDFKit, MySQL, S3 | `backend/` (+ estáticos montados a partir da raiz) | HTML gerado no servidor (Jade) + JS AMD em `backend/public/javascripts/` |

O Express **também serve** os estáticos da SPA (`/assets`, `/core`, `/views`, `/bower_components`, `/template`), pelo que num deploy típico há **um único processo Node** a servir marketing e laboratório. Ver [04-backend-express.md](04-backend-express.md).

Isto não é monorepo npm moderno: um `package.json` em `backend/` e dependências front declaradas em `bower.json` na raiz. Ver [02-estrutura-repositorio.md](02-estrutura-repositorio.md) e [03-stack-tecnologica.md](03-stack-tecnologica.md).

## O “core” da funcionalidade (o que não se pode perder na migração)

Independentemente de framework, o valor do sistema agrupa-se em:

1. **Catálogo e conteúdo editorial** — páginas institucionais, produtos, coleções, detalhe de modelo, alimentados pelo CMS (Contentful). Referência: [06-frontend-spa-angularjs.md](06-frontend-spa-angularjs.md), [09-integracoes-externas-dados.md](09-integracoes-externas-dados.md).
2. **Captura e transporte de medidas** — parâmetros corporais (`width`, `heigth` com grafia legada, `c_width`, `f_width`, `l_sleeve`, variantes por peça) na URL e nos controladores. Referência: [05-api-http-rotas.md](05-api-http-rotas.md), [08-modulos-geometricos-svg.md](08-modulos-geometricos-svg.md).
3. **Geração e visualização de moldes** — geometria 2D no browser (Paper.js no laboratório; lógica adicional em `core/basic-blouse.js` na SPA) e geração de PDF no servidor (PDFKit e fluxos antigos ligados a phantom/request). Referência: [07-laboratorio-jade-paperjs.md](07-laboratorio-jade-paperjs.md), [08-modulos-geometricos-svg.md](08-modulos-geometricos-svg.md), [05-api-http-rotas.md](05-api-http-rotas.md).
4. **Persistência e ficheiros** — contactos em MySQL, listagem e upload para S3, redirects e hosts legados. Referência: [09-integracoes-externas-dados.md](09-integracoes-externas-dados.md).

Tudo o resto (Slick, sliders, ngDialog, jQuery global em `scripts.js`, rotas duplicadas em `core/index.js`, Jade como motor de layout) é **meio de entrega** ou **dívida técnica**, não o núcleo semântico do negócio.

## Mapeamento com ideias de DDD

DDD aqui é usado como **linguagem e limites** para separar o que se mantém coeso na migração. Não implica microserviços desde o primeiro dia; pode ser módulos num monólito ou pacotes num monorepo.

### Contextos delimitados sugeridos

| Contexto | Responsabilidade | Artefactos legados principais | Integrações |
|----------|------------------|-------------------------------|-------------|
| **Marketing & discovery** | Apresentação do produto, SEO onde aplicável, navegação para o fluxo de medidas | AngularJS `base`, `views/*.html`, Contentful no cliente | Contentful API |
| **Model catalogue (read)** | Modelo de apresentação “produto/coleção” alinhado ao CMS | Controllers Contentful, templates | Contentful |
| **Measurements & session** | Normalizar medidas, validar, versionar typos (`heigth` vs `height`), deep links | Rotas GET parametrizadas, `modelController` | Nenhuma ou cookies futuros |
| **Pattern drafting (core domain)** | Regras geométricas por tipo de peça (blusa, camisa, calça), módulos Paper, export SVG | `backend/public/javascripts/modules/**`, `core/basic-blouse.js` | Nenhuma no núcleo puro |
| **Document output** | PDF, empacotamento, nomes de ficheiro, upload | `POST` PDF, PDFKit, rotas em `routes/*.js` | S3 |
| **Contact & leads** | Registo de contacto, anti-abuso | `GET /contact` com query (problemático), inserts MySQL | MySQL |
| **Infrastructure / shared kernel** | Config AWS, CORS, logging, erros | `app.js`, middleware | AWS SDK, env |

### Linguagem ubíqua (exemplos)

- **Peça** (shirt, pants, basic-blouse, …), **molde**, **medida**, **layout de laboratório**, **PDF gerado**, **objeto no bucket**.
- Manter um glossário único na migração ajuda a renomear rotas e DTOs sem perder correspondência com URLs antigas (compatibilidade ou redirects).

### Anti-Corruption Layer (ACL)

Na migração, isole **adaptadores** para sistemas externos em vez de espalhar SDKs pelos controladores:

- **Contentful** → serviço `CmsCatalogPort` + implementação HTTP (tokens só no servidor se possível).
- **S3** → `ObjectStoragePort`.
- **MySQL** → `ContactRepository` (ou ORM) atrás de interface.

O domínio de moldes não deve depender de `aws-sdk` ou do formato bruto do Contentful.

### Núcleo vs periferia

- **Núcleo (domínio):** cálculo/interpretação geométrica, invariantes de medidas por peça, decisão de quais SVGs entram no PDF.
- **Periferia:** Express handlers, Angular components, Jade → HTML, multer, morgan, sliders.

## O que significa “atualizar completamente” para Angular 21 + Express atual

“Completamente” implica **três grandes eixos** em paralelo: runtime front, runtime back, e **modelo de aplicação** (eliminar acoplamentos inaceitáveis).

### 1) Front-end: de AngularJS para Angular (versão alvo)

Angular moderno (incluindo a linha 18+) usa **TypeScript**, **CLI**, **router** sem hash por omissão, **HttpClient**, **signals** opcionais, e ecossistema npm — nada disso é compatível com `angular.module` e templates carregados como no 1.x.

Trabalho típico:

- Novo projeto Angular (alvo de versão a fixar no arranque do projeto com `ng version` na data da migração; o repositório fixa o objetivo como **Angular 21**).
- Reescrever **cada rota** e **cada feature** como componentes/rotas standalone ou módulos NgModule conforme padrão escolhido.
- Substituir **Contentful no browser** por chamadas ao **teu backend** (BFF) se o token não puder permanecer exposto — alinhado a [12-anomalias-legado-seguranca.md](12-anomalias-legado-seguranca.md).
- Substituir **jQuery + plugins** (Slick, ngDialog, tooltips) por alternativas Angular ou design system (ex. componentes próprios, CDK).
- Migrar `core/basic-blouse.js`: ou encapsula em **biblioteca TypeScript** testável, ou mantém JS legado atrás de um **Web Worker**/**iframe** até haver testes de paridade visual.

### 2) Back-end: Express atual e ecossistema Node

Passos mínimos:

- Subir **Express 5.x** ou última **4.x LTS** suportada, alinhar middleware (`express.json` nativo vs `body-parser` onde aplicável), revisar assinaturas de erros assíncronos.
- Corrigir **`package.json`** para refletir **todos** os `require` (multer, aws-sdk, mysql, pdfkit, underscore, etc.) — ver [03-stack-tecnologica.md](03-stack-tecnologica.md).
- **Eliminar Jade** (EOL): migrar views para **Pug** sucessor ou, preferível para SPA moderna, **só API + front Angular** para o laboratório (renderizar shell mínimo HTML ou servir SPA única com rota `/lab/...`).
- Reavaliar **phantom**, **request**, **rsvg** — substituir por pipelines suportados (headless Chromium controlado, `fetch`/`axios`, conversão SVG→PDF com bibliotecas mantidas).
- Endurecer **CORS**, **CSRF** em formulários, **rate limiting** em geração de PDF e uploads — ver [12-anomalias-legado-seguranca.md](12-anomalias-legado-seguranca.md).

### 3) Arquitetura de entrega

Opções claras (escolher uma como alvo):

- **A) Monólito moderado:** um servidor Express serve API + ficheiros estáticos do build Angular (`dist/`).
- **B) Dois artefactos:** API Express + CDN/nginx para Angular; comunicação só por HTTP/JSON.
- **C) Monorepo** (npm/pnpm workspaces): pacotes `domain`, `api`, `web` com fronteiras explícitas.

Em qualquer caso, **unificar** ou **apagar** duplicações (`core/index.js` vs `routes/index.js`, router `shirt.js` não montado) documentadas em [05-api-http-rotas.md](05-api-http-rotas.md) e [12-anomalias-legado-seguranca.md](12-anomalias-legado-seguranca.md).

## Inventário de pré-requisitos (checklist de descoberta)

Antes de codificar a migração, validar com dados reais:

1. **Contrato de medidas** — ordem real dos parâmetros nas URLs usadas em produção vs `modelController` (possível desalinhamento referido em [06-frontend-spa-angularjs.md](06-frontend-spa-angularjs.md)).
2. **Contacto** — hoje SPA POST `#` vs backend `GET /contact`; definir um único contrato REST.
3. **PDF** — quais fluxos ainda são usados (PDFKit vs legado phantom).
4. **Infra** — bucket S3, base MySQL, espaço Contentful; retirar credenciais do código.
5. **Caminho `GET /`** — corrigir `../application/` vs raiz conforme [02-estrutura-repositorio.md](02-estrutura-repositorio.md).

## Relação com os outros documentos `manager/`

| Necessidade | Documento |
|-------------|-----------|
| Árvore de pastas | [02-estrutura-repositorio.md](02-estrutura-repositorio.md) |
| Versões e gaps de dependências | [03-stack-tecnologica.md](03-stack-tecnologica.md) |
| Middleware e estáticos Express | [04-backend-express.md](04-backend-express.md) |
| Lista de rotas HTTP | [05-api-http-rotas.md](05-api-http-rotas.md) |
| SPA AngularJS | [06-frontend-spa-angularjs.md](06-frontend-spa-angularjs.md) |
| Laboratório Paper/RequireJS | [07-laboratorio-jade-paperjs.md](07-laboratorio-jade-paperjs.md) |
| Geometria e peças | [08-modulos-geometricos-svg.md](08-modulos-geometricos-svg.md) |
| Integrações | [09-integracoes-externas-dados.md](09-integracoes-externas-dados.md) |
| Como correr / build | [10-execucao-build-ambiente.md](10-execucao-build-ambiente.md) |
| Inventário de ficheiros | [11-inventario-modulos-ficheiros.md](11-inventario-modulos-ficheiros.md) |
| Riscos e dívidas | [12-anomalias-legado-seguranca.md](12-anomalias-legado-seguranca.md) |

## Atualizar o índice

Incluir uma linha em [00-indice.md](00-indice.md) apontando para este ficheiro `13` para que o índice reflita o mapa DDD e o plano de migração.
