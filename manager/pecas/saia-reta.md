# Saia reta (straight skirt block)

## Identificação

| Campo | Valor |
|-------|--------|
| Nome técnico | Straight skirt sloper / saia base |
| Tipo | Bloco inferior |
| Simetria | Quarto da saia (frente ou costas) |
| Pares de costura | Outro quarto, cós (opcional), fecho |

## Função

Base para saias lápis, evasê moderado, painéis, yokes e parte inferior de vestidos.

## Medidas de entrada (teoria)

| Medida | Símbolo | Uso |
|--------|---------|-----|
| Contorno cintura | W | Linha superior |
| Contorno quadril | H | Linha de quadril |
| Profundidade quadril | D_hip | Distância vertical cintura→quadril |
| Comprimento saia | L | Bainha |
| Folga | E | Ease em cintura/quadril |

## Construção plana — passos

1. Retângulo: **¼ quadril + ease** × comprimento L.
2. Marcar linha de quadril a D_hip da cintura.
3. Curvar cintura: diferença `(W/4 + ease_w) vs (H/4 + ease_h)`.
4. Inserir pences:
   - Costas: maior (ex. ¾"–1" intake).
   - Frente: menor (ex. ½").
5. Lateral recta ou levemente inclinada até bainha.
6. Fio: paralelo ao centro.

## Matemática

```
W_quarter = W/4 + ease_waist + dart_allowance
H_quarter = H/4 + ease_hip
Área_pences ≈ H_quarter - W_quarter (por quarto, distribuída)
```

Pence triangular:

```
A_dart = (1/2) × base_dart × altura_dart
```

## Derivações comuns

| Estilo | Técnica | Alteração geométrica |
|--------|---------|----------------------|
| A-line | Pivot/slash | Fechar pence, abrir bainha |
| Godê circular | Geometria | Raio `R = L / (2π × fração)` |
| Godê semi | Meio círculo | `R = (2/π) × waist` aprox. |
| Saia painel | Divisão | `W/n`, `H/n` por gomo |
| Yoke | Corte horizontal | Transferir pence ao yoke |
| Saia lápis | Bloco reto | Mínima abertura |

## Graduação (indústria)

Incrementos ΔX na cintura/quadril por tamanho; pontos cardinais na lateral e linha de quadril.

## Estado Modellista

| Aspeto | Estado |
|--------|--------|
| Código | **Ausente** |
| Rotas | Nenhuma |
| Relação | `c_width` no bodice usa lógica de “quadril” mas não gera saia |

## Implementação sugerida (migração)

| Módulo | Responsabilidade |
|--------|----------------|
| `SkirtMeasurements` | waist, hip, hipDepth, length |
| `draftStraightSkirt(m)` | Path2D puro |
| Rota | `GET /skirt/:waist/:hip/:hipDepth/:length` |

## Referências teóricas

- [../modelagem/12-catalogo-pecas-basicas-tecnicas.md](../modelagem/12-catalogo-pecas-basicas-tecnicas.md) §3
- [vestido.md](vestido.md) — união com bodice

## Peças relacionadas

- [calca.md](calca.md) — compartilha cintura/quadril, adiciona gancho
- [complementares.md](complementares.md) — cós
