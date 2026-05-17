# TASK — Montagem do canvas editor

**Prioridade:** P0  
**Onda:** 1  
**Depende de:** [TASK-editor-draft-adapter.md](TASK-editor-draft-adapter.md), [TASK-editor-toggle-ui.md](TASK-editor-toggle-ui.md)  
**Bloqueia:** todas as tools

---

## Objetivo

Substituir o conteúdo de `#preview` por um **SVG interactivo** gerido por `CanvasController`, mantendo o mesmo container CSS (scroll, fundo canvas).

---

## Estrutura DOM

```html
<div id="preview" class="preview">
  <svg id="editor-svg" class="editor-svg" xmlns="...">
    <g id="editor-viewport">
      <g data-layer="pieces">...</g>
      <g data-layer="handles">...</g>
      <g data-layer="ui">...</g>
    </g>
  </svg>
</div>
```

- V1: continua `preview.innerHTML = svgString` quando editor OFF.
- V2: `mountEditorCanvas(previewEl, document)` cria/reutiliza `#editor-svg`.

---

## CanvasController (`editor/canvas/mount.ts`)

| Método | Descrição |
|--------|-----------|
| `mount(container, doc)` | cria SVG, primeira render |
| `unmount()` | remove listeners, limpa |
| `setDocument(doc)` | substitui documento e redesenha |
| `setTool(toolId)` | delega para tool activa |
| `redraw()` | paths + seleção + handles |

---

## Render (`editor/canvas/render.ts`)

- Path `cut`: `stroke` sólido, cor `--color-pattern-stroke`
- Path `fold`: tracejado
- Nós seleccionados: círculos 4px (viewBox), fill brand
- Peça activa: opacidade 1; inactivas 0,85
- Reutilizar lógica de escala: 1 cm = N px via `viewBox` (alinhar com `render/svg.ts` escala)

---

## Hit-test (`editor/canvas/hit-test.ts`)

| Alvo | Prioridade | Raio (px screen → cm) |
|------|------------|------------------------|
| Nó | alta | 8px |
| Aresta | média | 6px distância perpendicular |
| Peça (fill) | baixa | point-in-polygon no `cut` |

Coordenadas: `screenToWorld(svg, clientX, clientY)` considerando transform do viewport.

---

## Eventos

| Evento | Handler |
|--------|---------|
| `pointerdown` | tool.onPointerDown |
| `pointermove` | tool.onPointerMove |
| `pointerup` | tool.onPointerUp |
| `pointerleave` | cancel drag |
| `wheel` + ctrl | zoom (TASK pan-zoom) |

`setPointerCapture` no drag de nó.

---

## Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `editor/canvas/mount.ts` | Controller |
| `editor/canvas/render.ts` | Desenho SVG |
| `editor/canvas/hit-test.ts` | Picking |
| `styles.css` | `.editor-svg`, `touch-action: none` no preview em modo editor |
| `app.ts` | mount/unmount no toggle |

---

## Critérios de aceite

- [ ] Editor ON mostra todas as peças do documento
- [ ] Scroll do `.preview` funciona com molde grande
- [ ] Toggle OFF remove `#editor-svg` e restaura V1
- [ ] Sem memory leak: listeners removidos no unmount
- [ ] Teste: `render` produz elementos `[data-piece-id]` por peça

---

## Performance

- Redesenhar só layers afectadas no drag (opcional); MVP full redraw aceitável < 20 peças.
