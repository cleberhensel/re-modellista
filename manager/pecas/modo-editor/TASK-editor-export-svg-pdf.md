# TASK — Export SVG e PDF a partir do documento

**Prioridade:** P0  
**Onda:** 4  
**Depende de:** [TASK-editor-draft-adapter.md](TASK-editor-draft-adapter.md), [TASK-editor-canvas-mount.md](TASK-editor-canvas-mount.md)  
**Bloqueia:** —

---

## Objetivo

Preview e **PDF** reflectem o `PatternDocument` editado quando modo editor está activo, incluindo margem de costura recalculada a partir do contorno `cut` actual.

---

## Pipeline

```text
PatternDocument
  → pathToSegments (por peça)
  → layout (reutilizar render/layout.ts)
  → seamAllowance(cut path, meta.seamAllowanceCm)
  → cut markers (render/cut-markers.ts)
  → SVG string (render/svg.ts ou editor/export/to-svg.ts)
```

---

## `editor/export/to-svg.ts`

```ts
renderDocumentToSvg(doc: PatternDocument): string
```

| Responsabilidade | Detalhe |
|------------------|---------|
| Contorno | paths `cut` do documento |
| Margem | `offsetPolygon` em cada `cut` fechado |
| Tesouras | mesmas regras V1 (`cut-markers.ts`) |
| Dobra / grain | paths `fold`, `grain` do documento |
| viewBox | `pieceLayoutBounds` + padding |

Não mutar `doc` durante export.

---

## PDF (`app.ts` → download)

| Modo | Fonte SVG |
|------|-----------|
| Editor OFF | `renderDraftToSvg(draft)` |
| Editor ON | `renderDocumentToSvg(patternDocument)` |

Manter escala e metadados (título produto, data) no PDF existente.

---

## Paridade V1

- Antes de qualquer edição (`manualEditRevision === 0`), SVG do documento deve ser **visualmente equivalente** ao V1 (teste snapshot ou comprimento de path por peça).

---

## Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `editor/export/to-svg.ts` | export |
| `editor/export/to-svg.test.ts` | paridade sem edição |
| `app.ts` | ramo PDF |
| Opcional: `render/svg.ts` | extrair helpers partilhados |

---

## Critérios de aceite

- [ ] Mover nó e PDF exporta novo contorno
- [ ] Margem de costura segue contorno editado (não contorno paramétrico antigo)
- [ ] Editor OFF: PDF inalterado vs comportamento actual
- [ ] Teste: editar + export não lança; SVG contém `d` alterado

---

## Edge cases

- Path auto-intersecting após edição: offset pode falhar → exportar contorno sem margem + `console.warn` (MVP) ou clip (P2)
- Peça com path inválido (< 3 nós): omitir peça no PDF com aviso
