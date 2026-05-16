# API HTTP e rotas

Convenção: rotas abaixo são relativas ao mount do router. O router `index` está em `/`, logo os seus paths são os paths absolutos da app. `basic-shirt` e `pants` têm prefixo indicado.

## Router `backend/routes/index.js` (montado em `/`)

| Método | Path | Comportamento resumido |
|--------|------|-------------------------|
| GET | `/` | `sendFile('index.html')` com `root: '../application/'` (ver nota de caminho em `12-anomalias-legado-seguranca.md`). |
| GET | `/contact` | Lê query string (`name`, `email`, `phone`, `message`), `INSERT INTO contact`, redirect 301 para `http://modellista.com.br/`. |
| GET | `/:width/:heigth/:c_width` | Render Jade `partials/index-2` com módulo `basic-blouse-2`, layout `layout-2`. |
| GET | `/basic_blouse/:width/:heigth/:c_width/:f_width/:l_sleeve` | Idem com módulo `basic-blouse`. |
| GET | `/h/:width/:heigth/:c_width/:f_width/:l_sleeve` | Idem com módulo `basic-blouse`, layout `layout-2` (comentário no código original mencionava `layout` noutro ramo). |
| POST | `/create-file/` | Gera nome aleatório, lê `front_svg`, `back_svg`, `sleeve_svg` do body; **código inconsistente** (usa `image`, `svg` não definidos no trecho visível — ver anomalias). |
| GET | `/list-bucket/` | `AWS.S3.listObjects` no bucket `modellista-desev`, render `list-bucket`. |
| GET | `/p` | Resposta HTML com form de teste POST para `http://dev.simstim.com.br:3000/create-pdf/`. |
| POST | `/create-pdf-velho` | Fluxo PDF legado (URLs para `dev.simstim.com.br`, phantom comentado). |
| POST | `/create-pdf/` | Semelhante: constrói URL de render e pipeline PDF. |
| GET | `/create-pdf-backend/:width/:height/:c_width/:f_width/:l_sleeve` | Endpoint GET para disparar geração PDF pelo backend. |
| POST | `/create-pdf-svg/` | Monta PDF com PDFKit a partir de estruturas SVG em JSON, upload S3. |
| GET | `/create-pdf-velho/:width/:heigth/:c_width/:p_width` | Variante GET com phantom/S3 (trecho no final do ficheiro). |

Parâmetros `heigth` mantêm o typo em todo o código legado.

## Router `backend/routes/basic-shirt.js` (montado em `/basic-shirt`)

| Método | Path | Comportamento |
|--------|------|----------------|
| GET | `/:width/:height/:c_width/:f_width/:l_sleeve` | Render partial `basic-shirt` (Jade) com medidas. |
| POST | `/pdf/` | Gera PDF a partir de SVG (padrão partilhado com pants), integração S3. |

## Router `backend/routes/pants.js` (montado em `/pants`)

| Método | Path | Comportamento |
|--------|------|----------------|
| GET | `/pnts/:width/:height/` | Render partial `pants`. |
| POST | `/pdf/` | Idem camisa para PDF+S3. |

## Router `backend/routes/users.js` (montado em `/users`)

| Método | Path | Comportamento |
|--------|------|----------------|
| GET | `/` | Placeholder `respond with a resource`. |

## Router `backend/routes/shirt.js` (não montado em `app.js`)

Assinaturas espelhadas a `basic-shirt.js` (GET com medidas, POST `/pdf/`). **Não exposto** pela aplicação atual salvo montagem manual noutro fork.

## Ficheiro `core/index.js` (Express Router isolado)

Define um **segundo conjunto** de rotas muito semelhante a `routes/index.js` (GET `/`, medidas, POST `/create-file/`, etc.), com `mysql`, `phantom`, `Rsvg`. **Não há** `require('./core/index')` em `app.js` — trata-se de módulo potencialmente usado por outro ponto de entrada ou projeto antigo. Não deve ser assumido como ativo na app principal.

## Base de dados (via rotas `index.js`)

- Conexão MySQL criada no próprio router (credenciais em código — ver documento de segurança).
- Operações observadas: `INSERT INTO contact`, uso de objeto `db` e queries referenciadas nos relatórios (ex.: produtos) conforme restante do ficheiro não listado linha a linha nesta doc.

## S3

- Bucket nomeado `modellista-desev` (grafia fixa no código).
- Uploads com ACL `public-read` nos fluxos de PDF analisados pelos subagentes.

## Ordem de rotas e colisões

O router `index` define `GET /:width/:heigth/:c_width` **depois** de rotas mais específicas como `/contact` e `/` — correto. Rotas como `/list-bucket/` devem estar antes dos parametrizados; no ficheiro aparecem depois de blocos GET parametrizados em algumas versões — convém validar em runtime se `/list-bucket` não é capturado por `/:width/...` (no grep atual, `/list-bucket/` está após `/create-file/` e rotas fixas parciais; **risco**: um segmento único pode colidir — a rota list-bucket tem dois segmentos, por isso está segura).
