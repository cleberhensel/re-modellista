# TASK — Modelo de documento editável

**Prioridade:** P0  
**Onda:** 0  
**Depende de:** —  
**Bloqueia:** [TASK-editor-draft-adapter.md](TASK-editor-draft-adapter.md), todas as tools

---

## Objetivo

Definir `PatternDocument` como fonte de verdade do molde **em modo editor**: peças, paths editáveis por nós, metadados de layout e flag de edição manual.

---

## Tipos (alvo em `editor/types.ts`)

### `PathNode`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `string` | UUID curto estável na sessão |
| `x`, `y` | `number` | cm, espaço da peça (antes de layout global) |
| `handleIn?` | `{ x, y }` | Bézier (V2.1); opcional no MVP |
| `handleOut?` | `{ x, y }` | Bézier (V2.1) |

### `EditablePath`

| Campo | Tipo |
|-------|------|
| `id` | `string` |
| `role` | `'cut' \| 'seam' \| 'fold' \| 'grain' \| 'notch' \| 'guide'` |
| `closed` | `boolean` |
| `nodes` | `PathNode[]` |
| `segmentKinds` | `('line' \| 'cubic')[]` | `length = nodes.length` se fechado, senão `nodes.length - 1` |

### `EditablePiece`

| Campo | Tipo |
|-------|------|
| `id` | `string` | ex. `front`, `sleeve` |
| `label` | `string` |
| `paths` | `EditablePath[]` |
| `layout` | `{ x, y, rotation?: number }` | offset no tabuleiro |
| `annotations` | `Annotation[]` | piques, fio (V2.1) |

### `PatternDocument`

| Campo | Tipo |
|-------|------|
| `version` | `1` |
| `unit` | `'cm'` |
| `pieces` | `EditablePiece[]` |
| `meta` | `{ productId, generatedAt, seamAllowanceCm }` |
| `manualEditRevision` | `number` | incrementa a cada mutação; `0` = só adapter |

### API mínima (`editor/document.ts`)

| Função | Comportamento |
|--------|----------------|
| `createEmptyDocument()` | documento vazio |
| `cloneDocument(doc)` | deep clone para undo |
| `getPiece(doc, id)` | peça ou undefined |
| `getPath(piece, pathId)` | path ou undefined |
| `moveNode(doc, pieceId, pathId, nodeId, x, y)` | valida bounds; bump revision |
| `insertNodeOnEdge(...)` | parâmetro t ∈ (0,1) na aresta |
| `removeNode(...)` | falha se `nodes.length < 4` em path fechado |
| `hasManualEdits(doc)` | `manualEditRevision > 0` |

---

## Regras de geometria

- Coordenadas em **cm**, Y para baixo (igual ao motor).
- Path `cut` é o contorno principal; `seam` pode ser derivado no export (não editável no MVP) ou omitido no documento e recalculado em `to-svg`.
- Nós duplicados no mesmo ponto (< 0,01 cm): rejeitar na API.

---

## Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `editor/types.ts` | Criar tipos |
| `editor/document.ts` | CRUD e mutações puras |
| `editor/document.test.ts` | move, insert, remove, revision |

---

## Critérios de aceite

- [ ] `moveNode` altera só o nó alvo e incrementa `manualEditRevision`
- [ ] `removeNode` impede polígono com menos de 3 vértices
- [ ] `cloneDocument` não partilha referências mutáveis
- [ ] Testes cobrem path aberto e fechado

---

## Notas de implementação

- Não duplicar `PathSegment` do motor no documento; adapter converte uma vez.
- IDs de peça alinhados com `PatternPiece.id` do `DraftResult`.
