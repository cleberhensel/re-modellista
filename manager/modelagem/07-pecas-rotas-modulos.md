# Peças, rotas e módulos

## Blusa básica — `basic-blouse.js`

| Aspeto | Detalhe |
|--------|---------|
| Ficheiro | `backend/public/javascripts/modules/basic-blouse.js` (~1030 linhas) |
| Arranque | `$(function(){ drawer.config(config); front; back; sleeve; })` |
| Canvases Jade | `#basic_front`, `#basic_back`, `#sleeve` em `partials/index-2.jade` |
| Layout | `layout-2.jade` carrega `modules/#{module}.js` |

Funções públicas no objeto `drawer`:

- `basicBlouseFront(config, divID?)`
- `basicBlouseBack(config, divID?)`
- `sleeve(intersection, config?, divID?)`
- Geometria: `armhole`, `armholeBack`, `shoulder`, `virtualDivision`, …
- Utilitários: `translateSvg`, `addHandles`, `oneCmInPx`, …

## Blusa reduzida — `basic-blouse-2.js`

| Aspeto | Detalhe |
|--------|---------|
| Rota | `GET /:width/:heigth/:c_width` |
| Parâmetros | Sem punho/manga na URL |
| UI debug | Cores (vermelho, amarelo, verde) nos retângulos guia |
| Manga | Código experimental com handles fixos; `sleeve()` comentado no arranque |

## Camisa — pasta `basic-shirt/`

| Ficheiro | Papel |
|----------|------|
| `basic-shirt.js` | `translateSvg`, `drawer` helpers, PDF AJAX; **front/back/sleeve antigos comentados** |
| `basic-shirt-front.js` | PaperScript: `drawer.basicBlouseFront(config)` |
| `basic-shirt-back.js` | PaperScript: costas + margens |
| `basic-shirt-sleeve.js` | (não lido linha a linha; padrão igual) |
| `partials/basic-shirt.jade` | 3 canvases + scripts paperscript |

Router monta `module: 'basic-blouse'` mas partial chama ficheiros `basic-shirt-*.js` — **acoplamento por nome de função** (`basicBlouseFront`), não por módulo AMD.

## Calças — `pants/`

| Ficheiro | Papel |
|----------|------|
| `pants.js` | Shell, `createFile` para PDF (comentado), `translateSvg` |
| `pants-front.js` | Grelha 5×5 de linhas guia; `seventh` de `config.width/7` |
| Rota | `GET /pants/pnts/:width/:height/` |
| Molde | **Não fecha contorno de calça** — só linhas de construção |

Fórmulas calças:

```
seventh.one = cast_to_px(width / 7)
seventh.two = cast_to_px(width / 14)
seventh.four = cast_to_px(width / 28)
cast_to_px(v) = v * 28.347
```

## Camisa alternativa — `shirt/` (não exposta)

Ficheiros: `shirt.js`, `shirt-front.js`, `shirt-back.js`, `shirt-sleeve.js`.  
Router `backend/routes/shirt.js` existe mas **não está em** `backend/app.js`.

## Módulo AMD educacional — `module-basic-blouse.js`

`define(['jquery','underscore','paper'], …)` com:

- `basic_front(w,h,h_w)`, `basic_back`, `sleeve`
- `basic_config` com `one_cm_in_px = 35.379` (diferente!)
- Versão antiga da cava com `alg = 2.3` hardcoded no vector handle

Útil para entender evolução do algoritmo, não é o entry point das rotas atuais.

## Backup

`backend/public/javascripts/modules/backup/` — snapshots `basic-blouse*.js`, `armhole-basic-blouse.js` — apenas histórico.

## `core/basic-blouse.js`

Cópia muito próxima da blusa com:

- `startPoint()` escalar 10 (não objeto)
- `getHipPx` com bug `.four` sem invocar função
- `createFile` ativo para `/create-pdf-svg/`
- Carregado se SPA/servidor expuser `/core/basic-blouse.js`
