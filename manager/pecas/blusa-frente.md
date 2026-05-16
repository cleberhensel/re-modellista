# Blusa — frente (bodice front)

## Identificação

| Campo | Valor |
|-------|--------|
| Nome técnico | Bodice front / bloco frente |
| Tipo | Bloco (sloper) com pences |
| Simetria | Meio frente (espelhar para peça completa) |
| Pares de costura | Costas (ombro, lateral, cava), manga (cava) |

## Função no produto

Base para blusas, camisas (parte superior), tops e frente de vestidos. Define decote, ombro, cava frente, pences e linha de cintura/quadril na frente.

## Medidas de entrada

### Obrigatórias (Modellista)

| Parâmetro `config` | UI / rota | Uso na frente |
|--------------------|-----------|---------------|
| `width` | Tórax / busto (cm) | `getWidthPx`, regra dos sétimos |
| `heigth` | Comprimento corpo (cm) | Altura do retângulo |
| `c_width` | Cintura (cm) | `getHipPx`, base lateral, pences |

### Indiretas (derivadas no código)

| Grandeza | Fórmula |
|----------|---------|
| `seventh().one` | `parseInt(((width/2)/7).toString().substring(0,3))` cm |
| `seventh().two` | `seventh.one / 2` |
| `seventh().four` | `seventh.one / 4` |
| `getWidthPx` | `ceil((width/4) × 28.347)` px |
| `getHeightPx` | `ceil(height × 28.347)` px |
| `getHipPx` | `(c_width/4) × 28.347` px |

## Sequência de construção (modelagem plana)

1. Retângulo base: origem `(start.one, start.one)`, largura `getWidthPx`, altura `getHeightPx`.
2. Linha lateral esquerda (centro frente): de `start + seventhPx.one` até à base.
3. Linha de bainha: de `(start.one, base)` até `(getHipPx + start.one, base)`.
4. Retângulos guia direitos (`rectangleRightOne/Two/Three`) — zona ombro/cava.
5. Gola: dois segmentos Bézier no decote; cópia tracejada = margem de costura.
6. Linha horizontal de busto (`lineCenter`).
7. Ombro + divisão virtual; interseção → início da cava.
8. Cava frente: 4 pontos Bézier (`armhole`).
9. Lateral direita (`rightSide`): da altura da cava até `getHipPx` na base.
10. Pences: centro + laterais (`centerLinePence`, `rightSidePence`, `leftSidePence`).
11. Fio: vertical do ombro ao hem no meio do bloco.

## Elementos geométricos — fórmulas

### Ombro

```
P0 = (seventhPx.one + start.one, start.one)
P1 = (getWidthPx + start.one, seventhPx.two + start.one)
```

### Divisão virtual (construção cava)

```
x1 = getWidthPx - seventhPx.two - seventhPx.four/2 + start.one
y1 = start.one
x2 = x1
y2 = seventhPx.one×3 + seventhPx.two - seventhPx.four + start.one
```

### Cava frente (`armhole`)

```
alg = seventh().four + 0.3
p1 = (x_div, intersection.y)
p2.y = intersection.y + 7 × oneCmInPx
p3 = canto lateral inferior da zona de cava (com handles ±seventhPx.four)
p4 = (getWidthPx + start + 1cm, linha de busto)
```

Handle de p2: vetor `(p2-p1)×alg` projetado para `handleOut`.

### Pences

```
y_apex_line = getHeightPx + start - 12 × oneCmInPx
x_center = (getHipPx + start) / 2
abertura base = 3 cm total (1,5 cm cada lado)
```

## Curvas e algoritmos

| Elemento | Representação |
|----------|----------------|
| Cava | Bézier cúbica, 4 segmentos Paper.js |
| Gola | Bézier 2 segmentos |
| Resto | Segmentos retos |

## Saída e integração

| Saída | Detalhe |
|-------|---------|
| Função | `drawer.basicBlouseFront(config, divID?)` |
| Canvas | `#basic_front` |
| Export | `translateSvg.load(exportSVG)` → JSON para PDF |
| Dependência | `intersection` da cava passada a `sleeve()` |

## Ficheiros no repositório

| Caminho | Notas |
|---------|--------|
| `backend/public/javascripts/modules/basic-blouse.js` | Canónico |
| `backend/public/javascripts/modules/basic-shirt/basic-shirt-front.js` | Paperscript, mesma API |
| `core/basic-blouse.js` | Duplicata + PDF |
| `backend/public/javascripts/modules/basic-blouse-2.js` | Variante 3 medidas, cores debug |

## Rotas HTTP

| Rota | Módulo |
|------|--------|
| `GET /basic_blouse/:width/:heigth/:c_width/:f_width/:l_sleeve` | `basic-blouse` |
| `GET /basic-shirt/:width/:height/:c_width/:f_width/:l_sleeve` | `basic-blouse` + partial shirt |

## Derivações de estilo (não no código)

- Decote V/U (alterar `collarCircle` / segmentos gola).
- Linha princessa (pence rotacionada para costura armhole–busto).
- Sem pences (fechar pence em rolinho).
- Peplum (slash na bainha).

## Lacunas Modellista

- Sem FBA (full bust adjustment) / tamanho de cup.
- Pences fixas (não manipuláveis).
- `f_width` / `l_sleeve` não usados na frente (só manga).

## Referências internas

- [../modelagem/04-construcao-blusa-basica.md](../modelagem/04-construcao-blusa-basica.md)
- [../modelagem/03-escala-regra-setimos.md](../modelagem/03-escala-regra-setimos.md)
- Par: [blusa-costas.md](blusa-costas.md), [manga.md](manga.md)
