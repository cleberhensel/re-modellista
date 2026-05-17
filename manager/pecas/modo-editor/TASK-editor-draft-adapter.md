# TASK — Adapter Draft → PatternDocument

**Prioridade:** P0  
**Onda:** 0  
**Depende de:** [TASK-editor-document-model.md](TASK-editor-document-model.md)  
**Bloqueia:** [TASK-editor-canvas-mount.md](TASK-editor-canvas-mount.md)

---

## Objetivo

Converter `DraftResult` (peças com `PathSegment[]`) em `PatternDocument` editável, preservando layout e metadados para export posterior.

---

## Entrada / saída

```ts
fromDraft(draft: DraftResult, options: {
  seamAllowanceCm: number;
  productId: string;
}): PatternDocument
```

---

## Mapeamento `PathSegment` → nós

| Segmento motor | Nós / segmentKinds |
|----------------|-------------------|
| `move` | inicia path; primeiro nó |
| `line` | nó no `to`; kind `line` |
| `cubic` | nó em `to` + handles (V2.1); MVP: amostrar curva em 2–4 pontos **ou** guardar cubic com handles no adapter |
| `dash` | path `role: 'guide'` ou ignorar no editor MVP |

**Decisão MVP:** converter `cubic` em cadeia de `line` com passo fixo (ex. 0,5 cm) **ou** preservar `cubic` com `handleIn`/`handleOut` no primeiro nó após curva — preferir **preservar cubic** no documento para não perder forma na manga/cavas.

Algoritmo `segmentsToNodes(segments)` em `editor/adapters/segments-to-path.ts`:

1. Ignorar `dash` para path `cut`.
2. Acumular nós únicos (tolerância 0,001 cm).
3. `closed` se último segmento fecha ao primeiro `move`.

---

## Layout

- Copiar posição de cada peça de `draft.layout` ou de `render/layout.ts` (`pieceLayoutBounds`) para `EditablePiece.layout`.
- Garantir mesma ordem de peças que `renderDraftToSvg`.

---

## Path roles

| Origem | `role` |
|--------|--------|
| Contorno principal da peça | `cut` |
| Linha de dobra (`fold`) | `fold` |
| Grainline existente no draft | `grain` |

Margem de costura **não** entra no documento no MVP; `to-svg` chama `seamAllowance` no path `cut` editado.

---

## Inverso (parcial, para testes)

`pathToSegments(path: EditablePath): PathSegment[]` — necessário para golden tests e futuro sync.

---

## Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `editor/adapters/from-draft.ts` | `fromDraft` |
| `editor/adapters/segments-to-path.ts` | conversão |
| `editor/adapters/path-to-segments.ts` | inverso |
| `editor/adapters/from-draft.test.ts` | blusa 2 peças; contagem de nós |

---

## Critérios de aceite

- [ ] `fromDraft` produz `manualEditRevision === 0`
- [ ] Número de peças = `draft.pieces.length`
- [ ] Comprimento do path `cut` (soma arestas) ≈ `pathLength` do motor ± 2% antes de edição
- [ ] Peça `sleeve` fecha contorno (regressão margem)
- [ ] Teste com fixture `draft-blusa.json` ou `draft()` em teste

---

## Edge cases

- Peça sem segmentos → omitir ou path vazio (não crashar).
- Múltiplos subpaths na mesma peça → múltiplos `EditablePath` com ids `cut-0`, `cut-1`.
