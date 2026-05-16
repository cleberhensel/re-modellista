# Parâmetros e medidas

## Objeto `config` (injetado no HTML)

Definido em `backend/views/layout-2.jade` e `layout-basic.jade`:

```javascript
var config = {
    token: true,
    width: <número>,      // busto / tórax (cm)
    heigth: <número>,     // comprimento do corpo (typo fixo no código)
    c_width: <número>,    // cintura (cm)
    f_width: <número>,    // punho OU manga (conforme fluxo — ver abaixo)
    l_sleeve: <número>,   // comprimento manga OU punho (conforme fluxo)
    module: '<nome-ficheiro>'
};
```

`drawer.config(params)` atribui:

- `this.height = params.heigth`
- `this.width = params.width`
- `this.c_width = params.c_width`
- `this.f_width = params.f_width`
- `this.l_sleeve = params.l_sleeve`

## Significado semântico (modelagem)

| Campo código | Uso na geometria | Origem UI (`model.html`) |
|--------------|------------------|---------------------------|
| `width` | Busto; base da regra dos sétimos e largura do retângulo (`width/4` em px) | `measures.chest` (rótulo “Tórax”) |
| `heigth` / `height` | Altura total da peça (retângulo vertical) | `measures.height` (“Comprimento do corpo”) |
| `c_width` | Cintura; `getHipPx()` usa `c_width/4` | `measures.waist` |
| `f_width` | Largura punho: `widthFist = f_width * oneCmInPx + 5 * oneCmInPx` | Ver inconsistência abaixo |
| `l_sleeve` | Comprimento manga até linha de punho | Ver inconsistência abaixo |

## Rotas Express → parâmetros

### Blusa completa (`routes/index.js`)

| Rota | Parâmetros URL | `module` |
|------|----------------|----------|
| `GET /basic_blouse/:width/:heigth/:c_width/:f_width/:l_sleeve` | 5 medidas | `basic-blouse` |
| `GET /h/:width/:heigth/:c_width/:f_width/:l_sleeve` | idem | `basic-blouse` |
| `GET /:width/:heigth/:c_width` | só busto, altura, cintura | `basic-blouse-2` |

### Camisa / fluxo produto (`routes/basic-shirt.js`)

| Rota | Parâmetros | `module` no Jade |
|------|------------|------------------|
| `GET /basic-shirt/:width/:height/:c_width/:f_width/:l_sleeve` | 5 medidas (`height` corrigido na rota, gravado como `heigth` no template) | `basic-blouse` (não `basic-shirt.js`!) |

### Calças (`routes/pants.js`)

| Rota | Parâmetros | `module` |
|------|------------|----------|
| `GET /pants/pnts/:width/:height/` | só `width` (busto?) e altura | `pants` |

## Inconsistência crítica: formulário SPA vs URL

Em `core/controllers.js`, `modelController.update`:

```javascript
var req = {
    height: $scope.master.height,
    width: $scope.master.chest,
    c_width: $scope.master.waist,
    f_width: $scope.master.arm,      // label UI: "Manga"
    l_sleeve: $scope.master.wrist     // label UI: "Punho"
};
var data_location = '.../basic-shirt/' + req.width + '/' + req.height + '/'
    + req.c_width + '/' + req.l_sleeve + '/' + req.f_width + '/';
```

Ordem na URL: `.../c_width / l_sleeve / f_width`  
Ordem esperada pelo router: `.../c_width / f_width / l_sleeve`

E semanticamente `f_width` no algoritmo é **punho**, `l_sleeve` é **comprimento de manga** — o formulário envia **manga no slot de punho** e **punho no slot de comprimento de manga**, salvo correção noutra camada.

Para migração: fixar contrato único (DTO) e testes com medidas conhecidas.

## Validação no UI

`views/model.html`: campos numéricos `0–200` (cm), obrigatórios. Não há validação server-side das medidas nas rotas GET.

## Variante `basic-blouse-2`

`drawer.config` em `basic-blouse-2.js` usa `p_width` em vez de `f_width` / `l_sleeve` — rota só passa 3 valores; manga e punho **não entram** nessa variante.
