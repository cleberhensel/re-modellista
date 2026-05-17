# TASK — Toggle modo editor

**Prioridade:** P0  
**Onda:** 0  
**Depende de:** —  
**Bloqueia:** [TASK-editor-canvas-mount.md](TASK-editor-canvas-mount.md)

---

## Objetivo

Controlo explícito na UI para **activar/desactivar** o modo editor, sem afectar o fluxo V1 quando desligado.

---

## UI alvo

### Localização

- Painel **Molde**, linha do título (`.panel-mold-header`), à esquerda do botão PDF **ou** na toolbar (se já existir placeholder).
- Componente: `<label class="editor-mode-toggle">` com `<input type="checkbox" id="editor-mode-toggle" />` + texto **Modo editor**.

### Estados visuais

| Editor | Preview | Toolbar |
|--------|---------|---------|
| OFF | SVG estático V1 | Oculta (`hidden` ou `display:none`) |
| ON | Canvas editor | Visível |

### Acessibilidade

- `aria-checked` no switch
- Label associado via `for`
- Teclado: Space alterna quando focado

---

## Comportamento (`app.ts`)

| Evento | Acção |
|--------|--------|
| Toggle ON | `editorEnabled = true`; `patternDocument = fromDraft(lastDraft)`; montar canvas; esconder render V1 |
| Toggle OFF | `editorEnabled = false`; desmontar canvas; `render()` V1 |
| Primeira carga | Ler `localStorage.getItem('remodellista.editorMode')` === `'1'` → ON |
| Mudança toggle | Persistir `'1'` / `'0'` |

Não regerar `draft()` só por ligar o toggle — usar último `DraftResult` em memória.

---

## Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `index.html` | `#editor-mode-toggle` no header do painel Molde |
| `styles.css` | `.editor-mode-toggle`, switch brand `--color-brand` |
| `app.ts` | `editorEnabled`, listeners, persistência |
| `app.integration.test.ts` | toggle OFF → innerHTML SVG; ON → canvas root presente |

---

## Critérios de aceite

- [ ] Com toggle OFF, comportamento idêntico ao V1 actual (sliders, PDF)
- [ ] Com toggle ON, preview deixa de ser só `innerHTML` estático
- [ ] Recarregar página restaura último estado do toggle
- [ ] PDF com editor OFF usa V1; com ON usa documento (após TASK export)

---

## Edge cases

- Toggle ON sem `draft` prévio → disparar `render()` uma vez para obter draft.
- Toggle OFF com edições não guardadas → **perder edições** (aceite MVP) ou aviso opcional (nice-to-have, não bloquear MVP).
