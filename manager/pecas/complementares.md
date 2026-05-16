# Peças complementares (aviamentos de modelagem)

Peças auxiliares que completam blusas, camisas, calças e casacos. **Nenhuma** está modelada como módulo dedicado no Modellista (exceto punho embutido na [manga.md](manga.md)).

---

## Colarinho clássico (shirt collar)

| Campo | Detalhe |
|-------|---------|
| Função | Acabamento decote com pé e aba |
| Medidas | Perímetro decote (linha de costura); CB→ombro; altura pé ~2,5–3 cm |
| Técnica | Traçar pé no decote; aba com ponta e roll line; relação decote curvo → menos stand |
| Modellista | Não |

---

## Pé de colarinha (collar stand)

| Campo | Detalhe |
|-------|---------|
| Função | Suporte e volume da gola |
| Geometria | Faixa curva = comprimento decote × altura |
| Modellista | Não |

---

## Punho (cuff)

| Campo | Detalhe |
|-------|---------|
| Função | Fecho da manga |
| Medidas | Contorno punho + folga botão |
| Técnica | Retângulo dobrado; sobreposição 2–3 cm |
| Modellista | Parcial: `widthFist` na manga (`f_width + 5 cm`) |

---

## Cós (waistband)

| Campo | Detalhe |
|-------|---------|
| Função | Cintura em calças/saias |
| Medidas | Contorno cintura + ease; altura cós 3–4 cm |
| Técnica | Retângulo; extensão para botão; elasticidade opcional |
| Modellista | Não |

---

## Bainha (hem)

| Campo | Detalhe |
|-------|---------|
| Função | Acabamento inferior |
| Técnica | Offset paralelo da bainha; dobra interna |
| Modellista | Linha de base do bodice actua como bainha |

---

## Bolso de peito (patch pocket)

| Campo | Detalhe |
|-------|---------|
| Função | Detalhe camisa |
| Medidas | Posição a partir de ombro e centro frente |
| Técnica | Retângulo + dobra; simetria opcional |
| Modellista | Não |

---

## Carcela / patilha (placket)

| Campo | Detalhe |
|-------|---------|
| Função | Abertura frontal com botões |
| Técnica | Extensão CF; dobra dupla; reforço |
| Modellista | Não |

---

## Gola Peter Pan / militar / etc.

| Tipo | Técnica resumida |
|------|------------------|
| Peter Pan | Dois arcos no decote |
| Militar | Faixa + ponta vincada ao decote |
| Gola alta | Extensão vertical do decote |

---

## Margem de costura (seam allowance)

| Campo | Detalhe |
|-------|---------|
| No código | `dashArray [8,10]` + token `DASH` no SVG |
| Valor típico | 1 cm no bodice Modellista |
| PDF | `doc.path().dash(8,'space:10')` |

Não é peça separada; é offset do contorno de corte.

---

## Índice de peças principais

- [00-indice.md](00-indice.md)
