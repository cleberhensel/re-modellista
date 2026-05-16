# Validação: motor TypeScript vs código legado

Análise histórica entre `backend/public/javascripts/modules/basic-blouse.js` (lab legado) e o motor TypeScript em `remodellista/engine/` (projeto isolado; sem paridade automática).

## Por que o molde novo não coincidia com o legado

### 1. Centro das pences (erro grave)

| | Legado | Motor (antes) |
|---|--------|----------------|
| Eixo X da pence | `(getHipPx() + startOne) / 2` | `(getWidthPx() / 2) + start` |

`getWidthPx` = **busto/4** em px; `getHipPx` = **cintura/4** em px. Com cintura ≠ proporção do busto, as pences deslocavam-se horizontalmente.

### 2. Abertura da pence na bainha (erro grave)

| | Legado | Motor (antes) |
|---|--------|----------------|
| Offset lateral | `(oneCmInPx * 3) / 2` = **1,5 cm** | `(1.5 * k) / 2` = **0,75 cm** |

O motor aplicava metade da folga prevista.

### 3. Curva da cava — handles Bézier (erro grave)

No Paper.js, entre `p2` e `p3`:

- `CP1 = p2 + handleOut` (relativo)
- `CP2 = p3 + handleIn` (relativo)

O motor antigo passava `p2 + handleOut` como **CP2** do primeiro cubic `p1→p2`, invertendo a semântica dos segmentos. A cava ficava com forma errada.

**Correção:** `armholePathSegments()` com três troços: reta `p1–p2`, cubic `p2–p3`, cubic `p3–p4`.

### 4. Gola ausente

Legado desenha dois segmentos Bézier na gola (`collar_seg1`, `collar_seg2`). O motor não incluía — falta o arco entre decote e ombro.

### 5. Fio (grainline) incorreto

Legado:

- Linha vertical em `x = getWidthPx()/2 + startOne` (centro do **bloco** busto/4)
- Interseção com ombro → até à bainha nesse X

Motor antigo ligava `intersection` ao centro da pence (`hipPx/2`) — segmento errado.

### 6. `startPoint` com dois valores

Legado: `{ one: 10 + k, two: 10 }`. Gola usa `startTwo` no handle. Motor usava só `start = startOne`.

### 7. O que ainda difere (esperado)

| Item | Estado |
|------|--------|
| Margens de costura tracejadas | Não portadas |
| Retângulos guia (marcação) | Não portados (só construção) |
| Linha horizontal `lineCenter` | Guia, não contorno |
| Costas / manga | Não implementados |
| Export PDF com `DASH` | Não ligado |

## Validação automática

```bash
cd remodellista
npm install
npm run test:coverage
```

Validação: apenas Vitest no projeto `remodellista/` (script `validate-parity` removido).

## Ficheiros corrigidos no motor

- `engine/context.ts` — `startOne`, `startTwo`
- `engine/armhole.ts` — cava + paths Bézier corretos
- `engine/pieces/blouse-front.ts` — gola, pences, fio, ordem de traços alinhada ao legado

## Como validar visualmente

1. `npm run dev` em `remodellista/`
2. Medidas: busto 92, comprimento 45, cintura 81 (defaults)
3. Comparar com lab legado: `/basic_blouse/92/45/81/12/27/` (backend + `basic-blouse.js`)

Diferenças residuais devem restringir-se a traços tracejados e guias não exportados no SVG do motor.
