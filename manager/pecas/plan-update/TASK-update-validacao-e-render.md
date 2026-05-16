# TASK — Validação, render e paridade legado (transversal)

**Tipo:** Infraestrutura de qualidade  
**Prioridade:** P0 (paralelo a blusa)  
**Afeta:** todos os produtos em `plan-update/`

---

## Objetivo

Garantir que **qualquer produto completo** seja exibido de forma legível e verificável contra o legado JavaScript e literatura de modelagem.

---

## Render / layout

| Item | Estado | Ação |
|------|--------|------|
| `layoutPieces` maxRowWidth | 5200 | Revisar grelha 2×2 para vestido/camisa 8 peças |
| SVG `width: 100%` | OK | Manter |
| Traço sólido vs tracejado | OK | Construção = dash |
| Labels por peça | OK | |

### Layout por produto

| Produto | Layout alvo |
|---------|-------------|
| blusa | 2 colunas: frente, costas |
| camisa | 1 fila ou 2×4: corpo, manga, complementos |
| saia / calça | 2 colunas |
| vestido | 2×2 alinhado na cintura |
| casaco | 3 colunas |

---

## Golden tests

Criar `engine/fixtures/` por produto:

| Fixture | Pontos |
|---------|--------|
| `blouse-golden.ts` | intersection, p4, shoulderStart, cfHem |
| `shirt-golden.ts` | + cap ease, NC |
| `skirt-golden.ts` | hipLineY, waistX |
| `pant-golden.ts` | crotchX, inseamY |

Teste: `expect(point).toBeCloseTo(golden, 2)`.

---

## Script paridade legado

| Script | Função |
|--------|--------|
| `scripts/compare-legacy-blouse.ts` (novo) | Exportar pontos de `basic-blouse.js` via node + comparar TS |

Não importar legado no bundle do motor — só CI offline.

---

## Métricas automáticas por peça

```ts
interface PieceQuality {
  closedOutline: boolean;
  selfIntersection: boolean;
  pathCount: number;
  bounds: PieceBounds;
}
```

Implementar `engine/quality.ts` (opcional): detetar `M` seguido de salto grande no mesmo path sólido.

---

## Documentação

Atualizar coluna **Remodellista** em `00-indice.md` só quando TASK do produto estiver done.

Atualizar `manager/modelagem/14-validacao-motor-vs-legado.md` com checklist pós-correção.

---

## Critérios de aceite

- [ ] `npm test` 100% pass  
- [ ] `npm run test:coverage` ≥ threshold  
- [ ] Nenhum produto P0 com peças sobrepostas no preview (teste layout)  
- [ ] Golden blusa commitado com bust 92  

---

## Referências

- `manager/modelagem/14-validacao-motor-vs-legado.md`
- `modelista-completo/core/basic-blouse.js`
