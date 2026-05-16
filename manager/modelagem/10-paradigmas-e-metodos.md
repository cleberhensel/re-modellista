# Paradigmas e métodos de modelagem (pesquisa)

## Três famílias principais

| Paradigma | Ideia | Matemática dominante | Uso típico |
|-----------|--------|----------------------|------------|
| **Modelagem plana (flat pattern)** | Moldes 2D a partir de medidas e blocos; peças “achatadas” | Proporções, divisões (¼, ⅛), retângulos guia, curvas de raio/Bézier | Pronto-a-vestir, alfaiataria industrial, CAD |
| **Modelagem em forma (draping)** | Tecido no manequim; contorno 3D → molde 2D | Geometria diferencial na prática; transferência por pinos | Alta costura, volumes complexos |
| **Modelagem modular / blocos (blocks/slopers)** | Um “molde-mãe” ajustado; derivam-se estilos | Transformações 2D (rotação, cisalhamento, slash-and-spread) | Base do ensino e do CAD profissional |

O **Modellista** implementa quase exclusivamente **modelagem plana paramétrica**: medidas → retângulo base → regra proporcional (sétimos) → curvas no canvas.

## Bloco (block) vs molde (pattern) vs estilo

Terminologia anglo-saxónica (Dress Pattern Making, industria):

- **Sloper / block:** molde base com **folga de vestir** mínima e pences estruturais; sem moda.
- **Pattern:** molde de peça final com design, folga extra, aviamentos, cortes.
- **Style / fashion pattern:** derivação comercial a partir do block.

**Conjunto mínimo clássico de blocos femininos:** frente e costas de blusa (bodice), manga, saia frente e costas. Extensões: bloco sem mangas, torso, vestido, casaco, calça, malha.

## Métodos de manipulação no plano (sem medir de novo o corpo)

Depois de existir um bloco com pences na cintura/lateral:

### Método pivotal (pivot / transfer dart)

- Fixa-se o **apex** da pence (próximo do ponto alto do busto nas costas ou busto na frente).
- Roda-se o papel em torno do apex até fechar a pence numa localização e abri-la noutra (ombro, cava, centro, etc.).
- **Matemática:** rotação rígida 2D; área da pence conservada (triângulo de supressão constante).

### Método de cortar e abrir (slash-and-spread)

- Corta-se o molde (radialmente ou em linha de estilo).
- Abre-se ou sobrepõe-se para flare, pregas, volume, mover pence.
- **Matemática:** soma de ângulos / deslocamentos; em CAD vira transformação de vértices com constraints.

### Equalização de perímetros

- Ao mover linhas de estilo, **comprimento de costura** entre peças adjacentes deve coincidir (± folga de manga na cabeça).
- Industria: medir **linha de costura**, não linha de corte (margem distorce arcos).

## Folgas (ease)

Fórmula conceptual universal:

```
Medida do molde = Medida corporal + Folga de vestir + Folga de desenho
```

| Tipo | Função | Ordem de grandeza (tecidos planos, busto) |
|------|--------|---------------------------------------------|
| **Wearing ease** | Movimento, respiração | ~5–10 cm no busto total |
| **Design ease** | Silhueta (justo, solto) | +0 a +20 cm conforme estilo |
| **Sleeve cap ease** | Caber cava com mobilidade | ~1–2,5 cm a mais no perímetro da cabeça vs cava (varia com tecido e ângulo) |

O código Modellista **não separa** explicitamente wearing vs design ease nas fórmulas; parte das constantes (`+1 cm`, `+5 cm` no punho, `12 cm` na pence) funcionam como **folga embutida**.

## Sistemas de proporção corporal

Além do busto/cintura/quadril medidos:

- **Regra do sétimo** (meio-busto ÷ 7): usada em construções latinas/europeias de blusa; no repo está codificada com truncamento em string.
- **Divisão em quartos:** `busto/4`, `cintura/4`, `quadril/4` para metade frente em moldes simétricos.
- **Antropometria industrial:** tabelas por tamanho (S, M, L) → **graduação** (grading), não o mesmo que molde custom.

## Graduação (grading) — visão geral

Escala de um tamanho base para uma grade:

- **Pontos cardinais** em cada peça; deslocamentos ΔX e ΔY por salto de tamanho.
- Regras podem ser **nested** (derivadas do bloco básico para estilos).
- Em CAD: estrutura de dados = polígono + metadados de grading por vértice.

O Modellista **não implementa grading**; só molde sob medida por URL.

## CAD e modelagem paramétrica (estado da arte)

Pesquisa académica e industrial recente:

- Curvas **Bézier cúbicas** e **NURBS** para cavas, golas, bainhas; pontos de controlo calculados a partir de pontos fixos de construção (não desenho livre).
- **Biarcs** e export DXF para produção em lote.
- **Pattern making from 3D:** parametrização de malha 3D → flattening com restrições de simetria de costura e fio.
- Frameworks open **paramétricos** (ex. FreeSewing): medidas → SVG com fórmulas declarativas (paralelo conceptual ao que o Modellista faz em JS imperativo).

## Referências úteis (consulta externa)

- [Dress Pattern Making — Blocks basics](https://dresspatternmaking.com/patternmaking-basics/blocks)
- [Garmenta — sleeve cap vs armhole curves](https://www.garmentaapparel.com/blog/pattern-school-how-to-ensure-your-sleeve-caps-and-other-curves-will-match)
- [Fashion Incubator — grading XY](https://fashion-incubator.com/how-to-check-the-accuracy-of-graded-patterns-pt-2)
- [Wikibooks — Pattern drafting / Pants](https://en.wikibooks.org/wiki/Pattern_drafting/Pants)
- [FreeSewing — Parametric design tutorial](https://freesewing.dev/tutorials/pattern-design/part2)
