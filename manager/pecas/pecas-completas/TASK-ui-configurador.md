# TASK — UI configurador de composição

**Prioridade:** P0  
**Onda:** 0  
**Depende de:** [TASK-opcoes-e-catalogo.md](TASK-opcoes-e-catalogo.md)

---

## Objetivo

Secção **Composição** na sidebar (abaixo de Modelo / acima de Medidas): checkboxes e presets que escrevem em `DraftOptions` e disparam `render()`.

---

## UI alvo

### Presets (botões ou select)

| Label | Acção |
|-------|--------|
| Só corpo | Todos slots OFF excepto bodice |
| Com manga | `includeSleeve` ON |
| Camisa completa | preset `camisa` |
| Camiseta | manga curta; sem colarinho/carcela |
| Colete | `sleeveless`; sem manga |

### Toggles (visibilidade por `compositionFields`)

| Toggle | Label PT |
|--------|----------|
| `includeSleeve` | Manga |
| `includeCollar` | Colarinho |
| `includeCuff` | Punho |
| `includePlacket` | Carcela |
| `includeChestPocket` | Bolso peito |
| `includeSidePocket` | Bolso lateral |
| `includeWaistband` | Cós |

Toggles desactivados quando `allowed: false` na receita ou dependência não satisfeita (ex.: punho sem manga).

### Manga

- Se `includeSleeve`: slider `sleeveLength` visível OU select curta / ¾ / longa.

---

## Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `index.html` | `#composition-panel`, checkboxes `data-slot` |
| `app.ts` | `readCompositionOptions()`, `syncCompositionVisibility()` |
| `styles.css` | Painel composição; toggles disabled |

---

## Critérios de aceite

- [ ] Mudar produto actualiza toggles visíveis e defaults
- [ ] Gerar + PDF reflectem só partes activas
- [ ] Preset “Camiseta” em `blusa` não inclui colarinho no SVG
- [ ] Testes `app.integration.test.ts` para um preset
