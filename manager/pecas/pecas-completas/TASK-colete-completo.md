# TASK — Produto completo: Colete (sem mangas)

**Product ID:** `colete` (novo)  
**Prioridade:** P1  
**Onda:** 1  
**Depende de:** [TASK-blusa-completa.md](TASK-blusa-completa.md)  
**Ficha:** derivado de [../top-sem-mangas.md](../top-sem-mangas.md)

---

## Objetivo

Colete / colete social = corpo **sem manga**, cava de braço, opcional bolso peito; sem colarinho de camisa.

---

## Composição

| Slot | Valor |
|------|-------|
| Bodice | ON |
| Manga | OFF (locked) |
| Colarinho | OFF |
| Carcela | OFF |
| Bolso peito | OFF (opcional ON) |
| `sleeveless` | true |
| `armholeDepthOffsetCm` | 2–3 |

---

## Catálogo

- `kind: garment`
- Medidas: bust, height, waist (sem wrist/sleeveLength obrigatórios ou opcionais)

---

## Critérios de aceite

- [ ] Registado em `registry` + `catalog/products.ts`
- [ ] 2 peças default; +1 com bolso
- [ ] Guardrails estáveis sem manga
- [ ] Não confundir com `top-sem-mangas` (documentar diferença: colete = preset nome; top = genérico)
