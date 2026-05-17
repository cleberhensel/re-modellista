# TASK — Toolbar do editor

**Prioridade:** P0  
**Onda:** 3  
**Depende de:** tools onda 2, [TASK-editor-pan-zoom.md](TASK-editor-pan-zoom.md)  
**Bloqueia:** —

---

## Objetivo

Barra horizontal no painel Molde com ferramentas MVP, estado activo e atalhos.

---

## Layout HTML (alvo)

```html
<div id="editor-toolbar" class="editor-toolbar" hidden>
  <div class="editor-toolbar-group" role="toolbar" aria-label="Ferramentas do molde">
    <button type="button" data-tool="select" class="editor-tool-btn is-active" title="Seleccionar (V)">...</button>
  </div>
</div>
```

Posição: entre `.panel-mold-header` e `#preview`.

---

## Ferramentas MVP

| `data-tool` | Ícone (sugestão) | Atalho | Tool module |
|-------------|------------------|--------|-------------|
| `select` | cursor | V | `select.ts` |
| `move` | setas cruz | M | `move.ts` |
| `pan` | mão | H | `pan-zoom.ts` |
| `add-node` | + vértice | N | `add-node.ts` |
| `delete-node` | − vértice | — | `delete-node.ts` |
| `undo` | ↶ | Ctrl+Z | undo stack |
| `redo` | ↷ | Ctrl+Shift+Z | undo stack |
| `zoom-out` | − | — | viewport |
| `zoom-fit` | ⊡ | — | viewport |
| `zoom-in` | + | — | viewport |

Ícones: SVG inline ou Unicode simples no MVP (sem dependência).

---

## Estilo (`styles.css`)

- Fundo `--color-surface`, borda inferior `--color-border`
- Botão activo: `background: var(--color-brand)`, cor branca
- Grupos separados por `gap` / divisor vertical
- Mobile: scroll horizontal na toolbar

---

## Comportamento

| Evento | Acção |
|--------|-------|
| Click tool | `setActiveTool(id)`; um só `.is-active` |
| Editor OFF | `toolbar.hidden = true` |
| Editor ON | `toolbar.hidden = false` |

---

## Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `index.html` | `#editor-toolbar` |
| `styles.css` | `.editor-toolbar`, `.editor-tool-btn` |
| `app.ts` | wiring tools + shortcuts globais |

---

## Critérios de aceite

- [ ] Toolbar só visível com modo editor ON
- [ ] Trocar ferramenta altera cursor e comportamento do canvas
- [ ] Undo/redo desactivados quando stack vazio
- [ ] Atalhos não disparam quando foco em `<input>` da sidebar
