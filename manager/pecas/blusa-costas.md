# Blusa — costas (bodice back)

## Identificação

| Campo | Valor |
|-------|--------|
| Nome técnico | Bodice back / bloco costas |
| Tipo | Bloco (sloper) |
| Simetria | Meio costas |
| Pares de costura | Frente (ombro, lateral), manga (cava costas) |

## Função no produto

Define ombro e cava das costas (menos funda que a frente), decote posterior, pences e largura de quadril na parte traseira.

## Medidas de entrada

Iguais à frente: `width`, `heigth`, `c_width` via `drawer.config(config)`.

## Diferenças frente vs costas

| Aspeto | Frente | Costas |
|--------|--------|--------|
| Ombro | Linha completa visível | Início deslocado `-1 cm` em X na construção virtual |
| Cava | `armhole()` — mais funda | `armholeBack()` — curva mais curta |
| Gola | Arco no decote frente | `collarCircleBack` — centro mais baixo, +3 cm |
| Linha lateral esquerda | Centro frente | Idem geometria de base |
| Margem costura | Tracejado em gola, ombro, cava | Idem em `basic-shirt-back.js` |

## Sequência de construção

1. Retângulo base (mesmas dimensões que frente).
2. Linha vertical costas: `start + 3×oneCmInPx` até base (variante shirt).
3. Bainha: até `getHipPx` (como frente).
4. Gola costas: segmentos Bézier com handle `(3×cm, cm/2)`.
5. Linha de busto horizontal (`lineCenter`).
6. Ombro virtual: `shoulder[0].x - oneCmInPx`.
7. Interseção divisão virtual × ombro.
8. Cava costas: 4 segmentos com handles em `seventhPx.two` e `four/2`, `four/4`.
9. Pences (mesma lógica de profundidade 12 cm).
10. Fio vertical (variante camisa).

## Cava costas — pontos (`armholeBack`)

| Ponto | Regra resumida |
|-------|----------------|
| p1 | Borda interna cava; Y = interseção ombro |
| p2 | X alinhado; Y = `3×seventh.one - two - four` |
| p2 handles | Verticais ±`seventhPx.two` |
| p3 | X antes da lateral; Y com `-1 cm` |
| p3 handles | Diagonais ±`four/2` |
| p4 | Canto superior lateral; handle in `(-four/2, -four/4)` |

## Funções de código

| Função | Ficheiro |
|--------|----------|
| `drawer.basicBlouseBack(config, divID?)` | `basic-blouse.js` |
| `drawer.armholeBack(intersection)` | idem |
| `drawer.collarCircleBack()` | idem |

## Saída

| Saída | Detalhe |
|-------|---------|
| Canvas | `#basic_back` |
| Export SVG | `svg_json` sem retornar `intersection` (manga usa só frente) |

## Ficheiros

- `backend/public/javascripts/modules/basic-blouse.js`
- `backend/public/javascripts/modules/basic-shirt/basic-shirt-back.js`
- `core/basic-blouse.js`

## Rotas

Mesmas da blusa completa (`/basic_blouse/...`, `/basic-shirt/...`).

## Derivações teóricas

- Costas com pence central (alguns slopers).
- Costas com recorte tipo esporte.
- Blusa costas inteira sem recorte (yoke).

## Lacunas Modellista

- Sem ajuste de lordose / comprimento costas vs frente.
- Cava costas não validada contra perímetro de manga separadamente.

## Referências

- [blusa-frente.md](blusa-frente.md)
- [../modelagem/05-curvas-bezier-manga.md](../modelagem/05-curvas-bezier-manga.md)
