# Vestido (dress block)

## Identificação

| Campo | Valor |
|-------|--------|
| Nome técnico | Dress block / união bodice + skirt |
| Tipo | Bloco composto |
| Simetria | Conforme blocos filhos |
| Pares de costura | Conforme estilo (com/sem cintura separada) |

## Função

Molde de vestido one-piece ou com cintura de junção; evita redraft independente de blusa e saia sem alinhamento.

## Composição

```
Dress block = Bodice (até cintura) + Skirt block (da cintura à bainha)
```

Variantes:

| Tipo | Descrição |
|------|-----------|
| Vestido natural waist | Costura na cintura |
| Vestido empire | Junção abaixo do busto |
| Torso block | Sem cintura definida (blusa longa) |
| Vestido com yoke | Corte horizontal no bodice |

## Medidas

União de:

- Bodice: busto, comprimento frente até cintura, costas, ombro, cava (se manga).
- Skirt: cintura, quadril, profundidade quadril, comprimento saia.

**Regra:** largura de cintura do bodice = largura de cintura da saia (após pences fechadas).

## Técnica de alinhamento

1. Draft bodice até linha de cintura (pences fechadas virtualmente).
2. Draft skirt a partir da mesma linha.
3. Alinhar fio (colinear ou offset documentado).
4. Eliminar pence duplicada na junção se transferida para costura de cintura.
5. Se manga: perímetro cava como em blusa isolada.

## Matemática de junção

```
W_bodice_waist_closed = W_skirt_waist_top ± seam_allowance
```

Desvio de quadril: bodice pode terminar acima do quadril; saia assume volume do quadril.

## Derivações

- Vestido tubo (sem pences saia — malha).
- Vestido com godê na saia (slash no bloco saia).
- Vestido camiseiro (bodice + saia + colarinho).

## Estado Modellista

| Aspeto | Estado |
|--------|--------|
| Peça única | **Não** |
| Possível hoje | Abrir laboratório blusa + (futuro) saia com mesmas medidas manualmente |
| Rotas | Nenhuma `/dress/...` |

## Implementação sugerida

```
GET /dress/:width/:heigth/:c_width/:skirt_length/...
→ draftBodiceToWaist(m) + draftSkirtFromWaist(m) → PDF multi-página
```

## Referências

- [blusa-frente.md](blusa-frente.md), [blusa-costas.md](blusa-costas.md)
- [saia-reta.md](saia-reta.md)
- [manga.md](manga.md) — se vestido com manga
