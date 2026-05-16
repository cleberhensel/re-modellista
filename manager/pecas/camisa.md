# Camisa (shirt — fluxo produto)

## Identificação

| Campo | Valor |
|-------|--------|
| Nome técnico | Shirt / camisa clássica |
| Tipo | Produto = bodice + manga + aviamentos |
| No Modellista | Fluxo de utilizador principal via SPA |

## Função

Peça comercial “modelar” no site: utilizador introduz medidas e abre laboratório de molde.

## Peças que compõem a camisa

| Componente | Bloco/teoria | Modellista |
|------------|--------------|------------|
| Frente bodice | [blusa-frente.md](blusa-frente.md) | Sim |
| Costas bodice | [blusa-costas.md](blusa-costas.md) | Sim |
| Manga | [manga.md](manga.md) | Sim |
| Colarinho + pé | Geometria decote | **Não** |
| Punho | Retângulo + aba | Parcial (`f_width` na manga) |
| Carcela / patilha | Extensão CF | **Não** |
| Bolso peito | Patch | **Não** |

## Fluxo utilizador

1. `views/model.html` — formulário medidas.
2. `modelController.update` → URL laboratório.
3. `GET /basic-shirt/:width/:height/:c_width/:f_width/:l_sleeve`
4. Jade `basic-shirt.jade` + paperscript:
   - `basic-shirt-front.js`
   - `basic-shirt-back.js`
   - `basic-shirt-sleeve.js`
5. PDF opcional: `POST /basic-shirt/pdf/`

## Parâmetros e contrato URL

Router espera ordem:

```
.../c_width/:f_width/:l_sleeve
```

SPA envia (possível bug):

```
.../c_width/:l_sleeve/:f_width
```

Mapeamento UI → código:

| Label UI | Campo Angular | Deveria ser parâmetro |
|----------|---------------|------------------------|
| Tórax | chest → `width` | `width` |
| Comprimento corpo | height | `heigth` |
| Cintura | waist → `c_width` | `c_width` |
| Manga | arm → `f_width` | **`l_sleeve`** |
| Punho | wrist → `l_sleeve` | **`f_width`** |

## Diferenças vs blusa laboratório

| Aspeto | `/basic_blouse/...` | `/basic-shirt/...` |
|--------|---------------------|---------------------|
| Layout Jade | `layout-2` + um JS | `layout-basic` + paperscript |
| Módulo declarado | `basic-blouse` | `basic-blouse` (igual) |
| Margens costura | Versão shirt mais completa | Tracejados em frente/costas |
| PDF endpoint | `/create-pdf-svg/` | `/basic-shirt/pdf/` |

## Colarinho (teoria — não implementado)

1. Medir perímetro decote na **linha de costura**.
2. Draft pé de colarinha: altura stand ~2,5–3 cm.
3. Draft aba de colarinho: largura fall, ponta, roll line.
4. Relação: decote mais curvo → menos “stand”.

## Ficheiros repositório

| Caminho | Papel |
|---------|--------|
| `backend/routes/basic-shirt.js` | Rota + PDF |
| `backend/views/partials/basic-shirt.jade` | Canvases |
| `backend/public/javascripts/modules/basic-shirt/*` | Desenho |
| `backend/public/javascripts/modules/basic-blouse.js` | Lógica partilhada |
| `core/controllers.js` | Entrada SPA |
| `backend/routes/shirt.js` | **Não montado** (duplicata legada) |

## Lacunas prioritárias

1. Corrigir ordem e semântica punho/manga na URL.
2. Colarinho e carcela como peças separadas no catálogo.
3. Unificar PDF num único serviço de domínio.

## Referências

- [blusa-frente.md](blusa-frente.md), [manga.md](manga.md)
- [complementares.md](complementares.md)
- [../modelagem/02-parametros-e-medidas.md](../modelagem/02-parametros-e-medidas.md)
