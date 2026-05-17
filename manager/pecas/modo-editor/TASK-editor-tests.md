# TASK — Testes do modo editor

**Prioridade:** P0  
**Onda:** transversal (0–4)  
**Depende de:** cada módulo implementado  
**Bloqueia:** release MVP editor

---

## Objetivo

Cobertura automatizada para documento, adapter, undo, export e fluxos UI críticos.

---

## Unitários (`vitest`)

| Módulo | Casos |
|--------|-------|
| `editor/document.test.ts` | move, insert, remove, revision, clone |
| `editor/undo.test.ts` | push, undo, redo, limite 50, clear |
| `editor/adapters/from-draft.test.ts` | blusa, camisa; contagem nós; pathLength |
| `editor/adapters/path-to-segments.test.ts` | roundtrip line path |
| `editor/canvas/hit-test.test.ts` | pick node, edge, piece |
| `editor/canvas/viewport.test.ts` | screen ↔ world |
| `editor/export/to-svg.test.ts` | paridade V1; SVG após moveNode |

---

## Integração

| Ficheiro | Casos |
|----------|-------|
| `app.integration.test.ts` | toggle ON/OFF; toolbar visible; regenerate dialog cancel/confirm |

Setup: `jsdom`, import `app.ts` com mocks mínimos de `localStorage`.

---

## Golden / snapshot (opcional)

- `fixtures/editor-blusa-baseline.svg` gerado uma vez
- Após `fromDraft` sem edição, normalizar SVG e comparar comprimentos de `d` por peça

---

## Cobertura alvo

| Área | Linhas |
|------|--------|
| `editor/**` | ≥ 90% |
| Ramo `app.ts` editor | ≥ 80% |

---

## CI

- `npm test` no workflow existente `.github/workflows/deploy-pages.yml`
- Falhar PR se cobertura `editor/` cair abaixo do limiar (quando configurado no vitest)

---

## Critérios de aceite

- [ ] Todos os testes acima existem e passam
- [ ] Nenhum teste depende de browser real (só jsdom)
- [ ] Teste de paridade documento vs draft antes de editar

---

## Ordem de implementação dos testes

1. document + undo  
2. adapter  
3. to-svg  
4. integration toggle + dialog
