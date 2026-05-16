# Backend Express

## Entrada do processo

- Ficheiro: `backend/bin/www`.
- Carrega `var app = require('../app')`.
- Porta: `process.env.PORT` ou **3000** por omissão.
- Usa `debug` com namespace `backend:server`.

## Ficheiro `backend/app.js`

### Imports relevantes

Além de Express e middlewares declarados no `package.json`, o ficheiro importa `multer`, `aws-sdk`, `underscore`, `pdfkit` (alguns não usados diretamente neste ficheiro, mas carregados ao arranque).

### Configuração da app

- `views` em `path.join(__dirname, 'views')` — templates Jade do laboratório.
- `view engine`: `jade`.
- `view options`: `{ layout: false }`.

### CORS

Middleware global que define:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept`

### Body e uploads

- `bodyParser.json` e `urlencoded` com limite **20mb**.
- `multer()` sem storage configurada (multer antigo, API legada).

### Estáticos (prefixos URL)

| Prefixo | Diretório físico |
|---------|-------------------|
| `/public` | `backend/public/` |
| `/assets` | `../assets` (raiz do repo) |
| `/core` | `../core` |
| `/bower_components` | `../bower_components` |
| `/views` | `../views` (HTML da SPA) |
| `/template` | `../template` |

Assim, a mesma app pode servir a SPA e os assets da raiz **sem** copiá-los para dentro de `backend/public/`.

### Routers montados

| Caminho base | Módulo |
|--------------|--------|
| `/` | `./routes/index` |
| `/users` | `./routes/users` |
| `/basic-shirt` | `./routes/basic-shirt` |
| `/pants` | `./routes/pants` |

**Não montado:** `./routes/shirt` (ficheiro existe, espelha `basic-shirt` em grande parte).

### Erros

- 404: middleware cria `Error('Not Found')` com `status` 404.
- Handler de erros em modo `development` renderiza `error` Jade com objeto `error` completo (inclui stack).
- Em produção (`app.get('env') !== 'development'`), segundo handler envia `error: {}` ao template (evita stack na UI, mas há dois handlers em cadeia — o padrão gerador do Express).

## Views Jade (`backend/views/`)

Ficheiros identificados:

- `index.jade`, `index-2.jade` — páginas de entrada do laboratório.
- `layout.jade`, `layout-2.jade`, `layout-basic.jade`, `layout-list.jade`.
- `layout/layout.jade`, `layout/layout-2.jade`, `layout/layout-basic.jade`, `layout/layout-pants.jade`.
- `partials/index-2.jade`, `partials/basic-shirt.jade`, `partials/shirt.jade`, `partials/pants.jade`.
- `list-bucket.jade` — listagem S3.
- `error.jade` — página de erro.

As rotas em `routes/index.js` usam `res.render('partials/index-2', data)` para vários padrões de medidas, passando `module` (nome do módulo RequireJS/Paper) e `layout`.

## Logging

- `morgan('dev')` em todas as requests.

## Autenticação e sessões

Não há Passport, JWT, sessão express-session, nem middleware de auth. Cookies são apenas parseados.
