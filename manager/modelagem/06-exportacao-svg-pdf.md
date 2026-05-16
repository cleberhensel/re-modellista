# Exportação SVG e geração PDF

## Pipeline browser

1. Desenho em canvas Paper.js (`paper.setup(canvasId)`).
2. `paper.project.exportSVG({ asString: true })` → string SVG.
3. `translateSvg.load(svg)` → objeto JSON serializável.

### `translateSvg.load` — duas variantes

**Variante simples** (`core/basic-blouse.js`, blusa lab antiga):

- Extrai `polygon`, `path`, `line` com atributo `stroke`.
- Converte `polygon` → comandos `M/L/... Z`.
- Retorno: `{ paths: [...], width, height }`.

**Variante com margem de costura** (`basic-shirt.js`, `basic-blouse` lab atual):

- Marca elementos com `stroke-dasharray` não vazio → sufixo `" DASH "` no path string.
- Retorno: `{ width, height, break_svg: { polygons, paths, lines } }`.

## Envio ao servidor

### Blusa (`core/basic-blouse.js` — ativo)

```javascript
POST /create-pdf-svg/
body: { front_svg, back_svg, sleeve_svg }  // strings JSON
```

### Camisa

```javascript
POST .../basic-shirt/pdf/
```

### Calças

```javascript
POST .../pants/pdf/
// espera 3 SVGs; implementação front incompleta
```

## `create_pdf_to_svg` (Express + PDFKit)

Ficheiro: `backend/routes/index.js` (e cópias em `basic-shirt.js`, `pants.js`).

Para cada peça SVG:

1. `new PDFDocument({ size: [width, height], margin: 40 })`.
2. Uma página por peça (frente, costas, manga).
3. Percorre `break_svg.paths`, `lines`, `polygons`:
   - Sem `DASH` → `doc.path(path).stroke()`.
   - Com `DASH` → acumula e depois `doc.path(dash).dash(8, 'space:10').stroke()`.
4. Grava `./tmp/{random}.pdf`.
5. Upload S3 → devolve URL ao cliente.

**Nota:** PDFKit interpreta strings no formato de path SVG (`M`, `L`, `C`, etc.) — depende de compatibilidade com os paths exportados pelo Paper.js.

## Fluxos legados (não preferenciais)

| Endpoint | Técnica |
|----------|---------|
| `POST /create-pdf/` | Monta URL para `create-pdf-backend` noutro host |
| `GET /create-pdf-backend/...` | Dispara render remoto |
| `POST /create-pdf-velho` | PhantomJS (comentado) |
| `POST /create-file/` | Código inconsistente (`image`, `svg` indefinidos) |
| `module-basic-blouse` click | POST para `./php/create-file.php` (inexistente no repo) |

## Margem de costura na representação

- Visual: `dashArray = [8, 10]` no Paper.js.
- Semântica PDF: token `DASH` embutido na string do path.
- PDF: `dash(8, 'space:10')` — coincide com `dash_sewing_margin`.

## Escala no PDF

Dimensões da página = `parseInt(svg.width)` × `parseInt(svg.height)` vindos do SVG exportado — **unidades do SVG Paper** (px lógicos do canvas), não mm reais. Para impressão 1:1 em cm seria necessário converter usando `oneCmInPx` ou metadados explícitos (ausentes).
