# Malha / knit block

## Identificação

| Campo | Valor |
|-------|--------|
| Nome técnico | Knit block / stretch sloper |
| Tipo | Bloco paralelo ao woven bodice |
| Tecido | Malha com elongação |

## Função

T-shirts justas, bodies, vestidos em jersey; reduz ou elimina pences (volume vai para elasticidade do tecido).

## Diferenças vs tecido plano (woven)

| Aspeto | Plano | Malha |
|--------|-------|-------|
| Pences | Sim (busto/cintura) | Raramente ou pequenas |
| Ease | Positivo | Zero ou negativo |
| Cava | Construção clássica | Pode simplificar |
| Fio | Crítico | Crítico (direção stretch) |
| Graduação | XY padrão | % stretch por zona |

## Matemática

Redução horizontal típica (depende do tecido):

```
W_pattern = W_body × (1 - stretch_reduction)
```

`stretch_reduction` entre 0% e 15% ou mais para jersey muito elástico.

Elongação medida em laboratório:

```
%stretch = (L_extended - L_relaxed) / L_relaxed
```

## Construção

1. Medir busto/quadril com fit desejado (compression vs relaxed).
2. Draft retângulo com redução aplicada.
3. Cava e decote simplificados (curvas mais suaves, menos pontos).
4. Sem cabeça de manga complexa se raglan/t-shirt.

## Estado Modellista

| Aspeto | Estado |
|--------|--------|
| Motor | Assume geometria **woven** (pences fixas, 28.347 px/cm) |
| Bloco malha | **Ausente** |

## Migração

- `FabricProfile { stretchWidth, stretchLength, recovery }`.
- `applyKnitReduction(measurements, profile)`.
- Opcional: desativar pences quando `profile.isKnit`.

## Referências

- [blusa-frente.md](blusa-frente.md) — contraste
- [top-sem-mangas.md](top-sem-mangas.md) — overlap estético
