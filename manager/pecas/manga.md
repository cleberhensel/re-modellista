# Manga set-in (basic sleeve)

## Identificação

| Campo | Valor |
|-------|--------|
| Nome técnico | Set-in sleeve / manga base |
| Tipo | Peça dependente da cava |
| Simetria | Eixo central da manga |
| Pares de costura | Frente e costas (cava), punho (opcional) |

## Função

Fecha a abertura do braço; cabeça da manga deve acomodar perímetro da cava com folga (ease) para movimento.

## Medidas de entrada

| Parâmetro | Uso |
|-----------|-----|
| `l_sleeve` | Comprimento até linha de punho (`× oneCmInPx`) |
| `f_width` | Largura punho: `widthFist = f_width×px + 5×px` |
| (implícito) | Perímetro cava = `armhole.path.length` da frente |

**Atenção:** formulário SPA pode trocar `f_width` e `l_sleeve` na URL — ver [../modelagem/02-parametros-e-medidas.md](../modelagem/02-parametros-e-medidas.md).

## Princípio matemático central

```
L_head_target ≈ L_armhole_front + L_armhole_back + E_cap
```

No Modellista:

```javascript
var armhole = new Path(/* 4 seg cava frente */);
var width = armhole.length;  // escala horizontal da grelha
```

`E_cap` **não** é calculado explicitamente; a forma da cabeça emerge da grelha + `addHandles`.

## Sequência de construção

1. Reconstruir cava frente (mesmos 4 segmentos) para obter `width`.
2. Criar canvas: largura `≈ width×2`, altura `l_sleeve×px`.
3. Linhas horizontais em Y: `start`, `seventhPx.two`, `one+two`, `2×one`.
4. Linhas verticais: esquerda `(width+start)/2`, centro `width+start`, direita espelhada.
5. Interseções + offsets:
   - `i1`: -3,3 cm em X
   - `i2`: +2,5 cm em Y e +2,5 cm em X (dois pontos na mesma linha)
   - `i5`: +`(seventhPx.one - oneCmInPx)` em X
6. Polígono 8 vértices (p1…p8).
7. Aplicar `addHandles` nos segmentos 4,0,1,3,2,7,5,6 (ordem empírica).
8. Punho: horizontal em `y = l_sleeve`; laterais desde `line_h4` até extremos do punho.

## Algoritmo `addHandles` (resumo)

| Caso | Handle |
|------|--------|
| Extremo inicial/final | Média de vetores vizinhos, metade do comprimento |
| Vizinhos mesma Y | `Rectangle.topCenter`, escala `/1.7` |
| Handles vizinhos existentes | Soma vetores `/3` |
| Default | `(prev+next)`, escala `/2.5` |

## Punho

```
widthFist = (f_width × 28.347) + (5 × 28.347)
margin_left = (width × 2) - widthFist
```

Linha de punho entre `(margin_left, l_sleeve_px)` e `(widthFist, l_sleeve_px)`.

## Funções e ficheiros

| Função | Ficheiro |
|--------|----------|
| `drawer.sleeve(intersection, config, divID)` | `basic-blouse.js` |
| `drawer.addHandles`, `widthFist` | idem |
| Variante experimental | `basic-blouse-2.js` (handles fixos ±155 px) |
| AMD protótipo | `module-basic-blouse.js` (`sleeve`, `width` fixo 23×cm em versão antiga) |

| Canvas | `#sleeve` |
| Entrada obrigatória | `intersection` de `basicBlouseFront` |

## Export e PDF

Incluída no POST com `front_svg` e `back_svg` → `create-pdf-svg` ou `/basic-shirt/pdf/`.

## Derivações teóricas

| Estilo | Técnica |
|--------|---------|
| Manga curta | Reduzir `l_sleeve` |
| Bufante | Slash na cabeça |
| Raglan | Bloco separado (ombro+cava) |
| Kimono | Extensão do bodice |

## Lacunas Modellista

- Sem ease reportado (`L_cap - L_armhole`).
- Costas da cava não entram no `width` inicial.
- Versão shirt: `basic-shirt-sleeve.js` (paperscript) — validar paridade.

## Referências

- [blusa-frente.md](blusa-frente.md)
- [../modelagem/05-curvas-bezier-manga.md](../modelagem/05-curvas-bezier-manga.md)
- [../modelagem/13-manipulacao-pences-graduacao-folgas.md](../modelagem/13-manipulacao-pences-graduacao-folgas.md)
