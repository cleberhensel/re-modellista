# Índice — Modo editor (V2)

Plano para transformar o preview de molde em **editor vetorial** com toolbar, undo e toggle Modo editor / Modo visualização.

## Princípios

| Regra | Descrição |
|-------|-----------|
| Motor paramétrico mantém-se | `draft()` continua a origem do molde |
| Opção A | Slider/preset/produto após edição manual → confirmar perda de edições |
| Modo editor opcional | Toggle na UI; desligado = comportamento V1 (SVG estático) |
| MVP toolbar | Seleção, Mover, Pan, Zoom, +nó, −nó, Desfazer/Refazer |
| Documento editável | `PatternDocument` separado de `DraftResult`; export usa documento |

## Ondas

| Onda | Foco | Tasks |
|------|------|--------|
| 0 | Fundação | documento, adapter, toggle |
| 1 | Canvas | mount SVG interativo, pan/zoom |
| 2 | Edição núcleo | select, move, add/delete node, undo |
| 3 | Toolbar + aviso | toolbar UI, confirmação regeneração |
| 4 | Export | SVG preview + PDF a partir do documento |
| 5 | Ferramentas V2.1 | bézier, pique, fio, medir, mover peça |

## Tasks (por ordem de dependência)

### Onda 0 — Fundação

| Ficheiro | Resumo |
|----------|--------|
| [TASK-editor-document-model.md](TASK-editor-document-model.md) | Tipos `PatternDocument`, paths, nós, layers |
| [TASK-editor-draft-adapter.md](TASK-editor-draft-adapter.md) | `DraftResult` → `PatternDocument` |
| [TASK-editor-toggle-ui.md](TASK-editor-toggle-ui.md) | Toggle activar/desactivar modo editor |

### Onda 1 — Canvas

| Ficheiro | Resumo |
|----------|--------|
| [TASK-editor-canvas-mount.md](TASK-editor-canvas-mount.md) | Substituir preview estático por canvas editor |
| [TASK-editor-pan-zoom.md](TASK-editor-pan-zoom.md) | Pan (espaço) + zoom |

### Onda 2 — Edição núcleo

| Ficheiro | Resumo |
|----------|--------|
| [TASK-editor-tool-select.md](TASK-editor-tool-select.md) | Seleccionar peça, aresta, nó |
| [TASK-editor-tool-move.md](TASK-editor-tool-move.md) | Arrastar nó / handle |
| [TASK-editor-tool-add-node.md](TASK-editor-tool-add-node.md) | Inserir nó em aresta |
| [TASK-editor-tool-delete-node.md](TASK-editor-tool-delete-node.md) | Apagar nó (mín. 3) |
| [TASK-editor-undo-redo.md](TASK-editor-undo-redo.md) | Stack undo/redo no documento |

### Onda 3 — Toolbar e regeneração

| Ficheiro | Resumo |
|----------|--------|
| [TASK-editor-toolbar.md](TASK-editor-toolbar.md) | Barra de ferramentas no painel Molde |
| [TASK-editor-regenerate-warning.md](TASK-editor-regenerate-warning.md) | Opção A: confirmar antes de regerar |

### Onda 4 — Export

| Ficheiro | Resumo |
|----------|--------|
| [TASK-editor-export-svg-pdf.md](TASK-editor-export-svg-pdf.md) | Render e PDF a partir do documento editado |

### Onda 5 — V2.1

| Ficheiro | Resumo |
|----------|--------|
| [TASK-editor-tool-bezier.md](TASK-editor-tool-bezier.md) | Segmentos curvos + handles |
| [TASK-editor-tool-notch.md](TASK-editor-tool-notch.md) | Piques em arestas |
| [TASK-editor-tool-grainline.md](TASK-editor-tool-grainline.md) | Fio / grainline |
| [TASK-editor-tool-measure.md](TASK-editor-tool-measure.md) | Medir distância / arco (cm) |
| [TASK-editor-tool-move-piece.md](TASK-editor-tool-move-piece.md) | Mover peça inteira no layout |

### Transversal

| Ficheiro | Resumo |
|----------|--------|
| [TASK-editor-tests.md](TASK-editor-tests.md) | Testes unitários e integração |

## Plano geral

- [00-plano-geral-modo-editor.md](00-plano-geral-modo-editor.md) — diagrama, dependências, critérios de done

## Referências no repo

- Tipos actuais: `engine/types.ts` (`PathSegment`, `PatternPiece`)
- Render V1: `render/svg.ts`, `render/seam-allowance.ts`, `render/layout.ts`
- UI: `index.html`, `app.ts`, `styles.css`
- Legado Paper.js: `modelista-completo/backend/public/javascripts/paper.js`
