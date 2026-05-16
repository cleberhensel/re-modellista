# TASK — Peça completa: Calça

**Product ID:** `calca`  
**Sub-peças:** `pant-front`, `pant-back`  
**Ficha:** [../calca.md](../calca.md)  
**Prioridade:** P2  
**Depende de:** [TASK-front-seletor-pecas.md](TASK-front-seletor-pecas.md)  
**Legado parcial:** `backend/public/javascripts/modules/pants-front.js` (grelha incompleta)

---

## Objetivo

Substituir protótipo de grelha 5×5 por bloco de calça com gancho fechado, frente e costas, medidas de alfaiataria reais.

---

## Medidas (`PantMeasurements`)

| Campo | cm | Crítico |
|-------|-----|---------|
| `waist` | Cintura | sim |
| `hip` | Quadril | sim |
| `crotchDepth` | Profundidade gancho (sentado) | **sim** |
| `inseam` | Entrepernas | sim |
| `outseam` | Opcional validação | não |
| `thigh`, `knee`, `ankle` | Fase 2 taper | não |

---

## Contexto `buildPantContext(m, options)`

```ts
hipQuarterPx = (hip / 4) * k
waistQuarterPx = (waist / 4) * k
crotchLineY = startOne + crotchDepth * k
frontExtension = (hip / 2 / 8) * k   // literatura
backExtension = frontExtension + 2.5 * k
```

**Não** usar regra dos sétimos do busto.

---

## `pant-front.ts` — sequência

1. Retângulo quarto: `hipQuarterPx` × `outseam * k` (ou `inseam + crotchDepth`).
2. Marcar `crotchLineY`.
3. Extensão gancho frente na linha do gancho: `+frontExtension` em X a partir do eixo CF.
4. Curva gancho frente (3–4 pontos Bézier) até início lateral.
5. Entrepernas: curva até `(inseam)` no eixo interior.
6. Lateral: até cintura com pence mínima ou ease.
7. Cintura: linha com pequena curva.
8. Fio: vertical no meio do quarto.

## `pant-back.ts`

- `backExtension` maior.
- Pence costas na cintura (2–3 cm).
- Gancho costas mais longo (perímetro > frente).

---

## Validação estrutural

```ts
function isPantFrontStable(ctx, front): boolean {
  return crotchCurveClosed(front) && inseamLineY > crotchLineY;
}
function crotchPerimeterMatch(front, back): boolean {
  return Math.abs(lenFront - lenBack) / lenFront < 0.15; // 15% ease costas
}
```

---

## Produto `products/pant.ts`

```ts
pieces: [pant-front, pant-back]
productId: "calca"
```

---

## Guardrails

| Regra | Valor |
|-------|-------|
| crotchDepth | 20–35 cm |
| inseam | 60–90 cm |
| hip | waist * 1.05 .. 1.4 |
| waist | 56–130 |

---

## Front

Sliders: waist, hip, crotchDepth, inseam. Ocultar bust/sleeve.

---

## Testes (100%)

| Caso | |
|------|---|
| front gancho points inside bounds | |
| back extension > front | |
| product 2 pieces | |
| guardrails crotchDepth min | |
| no seventh import in pant modules | |

---

## Migração legado

- Rota `GET /pants/pnts/:width/:height/` mapear para novo DTO via ACL (width→hip documentado).
- Não portar viewport 1000×1000 fixo.

---

## Critérios de aceite

- [ ] Contorno frente fecha (path contínuo).
- [ ] Gancho visível e diferente frente/costas.
- [ ] Coverage 100%.
