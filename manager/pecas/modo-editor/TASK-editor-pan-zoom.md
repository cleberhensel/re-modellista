# TASK — Pan e zoom no canvas

**Prioridade:** P0  
**Onda:** 1  
**Depende de:** [TASK-editor-canvas-mount.md](TASK-editor-canvas-mount.md)  
**Bloqueia:** —

---

## Objetivo

Navegar moldes grandes: **pan** (arrastar fundo ou ferramenta Pan) e **zoom** (roda do rato / botões toolbar).

---

## Viewport (`editor/canvas/viewport.ts`)

Estado:

| Campo | Tipo | Default |
|-------|------|---------|
| `panX`, `panY` | number | 0 |
| `scale` | number | 1 |

Aplicar em `<g id="editor-viewport">`:

```text
transform = translate(panX, panY) scale(scale)
```

Coordenadas de edição: converter screen ↔ world **antes** de mutar o documento.

---

## Ferramenta Pan (toolbar)

| Acção | Comportamento |
|-------|----------------|
| Activar Pan | cursor `grab`; drag em área vazia move viewport |
| Space (hold) | pan temporário mesmo com Select activo (padrão CAD) |
| Middle mouse | pan (desktop) |

---

## Zoom

| Input | Comportamento |
|-------|----------------|
| Ctrl + wheel | zoom em torno do cursor |
| Toolbar `+` / `-` | zoom centro do viewport |
| Toolbar `Ajustar` | `fitToDocument(doc)` — enquadra todas as peças com margem 5% |

Limites: `scale` ∈ [0,25, 4].

---

## Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `editor/canvas/viewport.ts` | estado + transforms |
| `editor/tools/pan-zoom.ts` | tool Pan + wheel handler |
| `TASK-editor-toolbar.md` | botões zoom/fit |

---

## Critérios de aceite

- [ ] Zoom não desloca nós no documento (só viewport)
- [ ] Após fit, todas as peças visíveis no `#preview`
- [ ] Pan com Space não selecciona nós no `pointerup`
- [ ] Testes unitários em `worldToScreen` / `screenToWorld` (valores fixos)

---

## Edge cases

- Preview pequeno (mobile): pinch-zoom futuro; MVP wheel suficiente.
- `scale` extremo: hit-test usa mesma transform (testar nó clicável após zoom 4x).
