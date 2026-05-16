# Catálogo de peças básicas — técnicas e matemática

Foco em **blocos fundamentais** (slopers) e derivações imediatas. Para cada peça: medidas-chave, construção, curvas, pences, relações entre peças, estado no Modellista.

---

## 1. Blusa / corpete (bodice) — frente e costas

### Função

Base de camisas, blusas, tops, parte superior de vestidos.

### Medidas corporais típicas

| Medida | Símbolo comum | Uso |
|--------|---------------|-----|
| Contorno de busto | B | Largura de peito, quartos |
| Comprimento frente/costas | CF, CB | Altura do bloco |
| Largura de costas | (derivada) | Ombro |
| Contorno de cintura | W | Pences, linha de cintura |
| Contorno de quadril | H | Bainha se bloco longo |
| Altura de busto, ombro, etc. | Vários | Posição de pence lateral |

### Técnica de construção (plano)

1. Retângulo: **¼ busto** × **comprimento**.
2. Marcar linha de busto, cintura, quadril (proporções ou medidas verticais).
3. **Ombro:** linha com declive; largura ombro ≈ f(B) ou medida direta.
4. **Cava:** curva por interseção ombro + linhas guia (sétimos); frente mais funda que costas.
5. **Gola decote:** arco ou V a partir de `S` (sétimo).
6. **Pences:** cintura e/ou lateral; apex próximo do busto (frente) ou omoplata (costas).
7. **Fio:** vertical no centro frente/costas.

### Matemática / algoritmos

- `S = (B/2)/7` e frações `S/2`, `S/4`.
- Cava: Bézier 3–4 segmentos; interseção reta×reta.
- Área da pence ≈ diferença quadril–cintura distribuída.

### Derivações comuns

- Blusa sem pences (transferir para rolinho/gather).
- Linha princessa (pence rotacionada para costura vertical).
- Corpete com recortes, peplum (slash-and-spread na bainha).

### Modellista

| Aspeto | Estado |
|--------|--------|
| Frente / costas / manga | **Implementado** (`basic-blouse.js`) |
| Regra sétimos + retângulos guia | **Sim** |
| Margem costura tracejada | **Sim** |
| Cup size / FBA | **Não** |

---

## 2. Manga base (set-in sleeve)

### Função

Manga justa com cabeça arredondada para cavas de blusa/camisa.

### Medidas

| Medida | Uso |
|--------|-----|
| Comprimento de manga | Linha inferior até punho |
| Contorno de punho | Largura da bainha |
| **Perímetro da cava** (medido no molde) | Largura da cabeça |
| Opcional: largura de braço | Grelha de construção |

### Técnica

1. Grelha horizontal em níveis `S`, `S/2`, `2S` (ou interseções com linhas verticais).
2. Pontos da cabeça por interseções + offsets empíricos.
3. Suavização da cabeça (curva francesa / Bézier / smooth).
4. Laterais rectas ou levemente inclinadas até punho.
5. **Ease:** cabeça ligeiramente maior que cava; distribuição na frente (mais ease) e costas.

### Matemática

```
L_cap > L_armhole
E_cap = L_cap - L_armhole   (tipicamente 1–2,5 cm costura incluída)
```

Modellista: `width = armhole.path.length`; punho `f_width × k + 5cm`.

### Derivações

- Manga curta, bufante (slash na cabeça), raglan (cava eliminada — outro bloco), kimono.

### Modellista

**Implementado** com grelha + `addHandles`; ease não calculado explicitamente.

---

## 3. Saia reta (straight skirt block)

### Função

Base de saias lápis, evasê moderado, bases de vestido.

### Medidas

- Cintura, quadril, comprimento saia.
- **Profundidade de quadril** (vertical cintura→quadril).

### Técnica

1. Retângulo: **¼ quadril + ease** × comprimento.
2. Linha de quadril horizontal.
3. Curva cintura (diferença cintura–quadril).
4. Pences traseiras (maior) e frontais (menor) ou pence única.

### Matemática

```
¼ hip + ease_hip
dart_intake ≈ (hip_quarter - waist_quarter) distribuído
```

### Derivações

| Estilo | Técnica |
|--------|---------|
| Evasê (A-line) | Fechar pence + abrir bainha (slash) |
| Godê | Círculo ou inserções triangulares (geom. πR) |
| Painéis (gores) | Dividir `(waist, hip)` por n gomos |
| Yoke | Cortar horizontalmente; transferir pence |

### Modellista

**Não implementado** (só blusa/camisa/calça parcial).

---

## 4. Calça base (trouser / pant block)

### Função

Calças formais, jeans (com alterações), bermudas.

### Medidas críticas

| Medida | Importância |
|--------|-------------|
| Cintura, quadril | Como saia + mais ease |
| **Altura de quadril sentado (crotch depth / rise)** | Define gancho |
| Entrepernas (inseam) | Comprimento perna |
| Lateral (outseam) | Validação |
| Circunferência de coxa, joelho, tornozelo | Ajuste de perna |

### Técnica (resumo Wikibooks / métodos europeus)

1. Grelha: ¼ quadril; linha de gancho horizontal na **profundidade de gancho**.
2. **Extensão de gancho frente:** ~ `(hip/2)/8` ou fórmulas similares.
3. **Extensão de gancho costas:** maior que frente (+2–4 cm típico).
4. Curvas de gancho (frente mais curta, costas mais longa).
5. Linha de fio em cada perna; pence costas na cintura.
6. Linha de joelho / ficha opcional.

### Matemática

- Gancho relaciona **circunferência superior da perna** + **profundidade** (não só proporção de busto).
- Simetria esquerda/direita; frente ≠ costas.

### Derivações

- Pantalão largo, culotte (slash perna), jeans (bloco com reforços e corte diferente).

### Modellista

**Protótipo** (`pants-front.js`): grelha 5×5 com `width/7`; **sem** gancho fechado nem pernas.

---

## 5. Vestido (dress block)

### Função

União blusa + saia (ou blusa longa) com alinhamento de cintura.

### Técnica

- Draft bodice até cintura + skirt block abaixo, ou bloco torso inteiro.
- **Alinhar** largura de cintura e fio; tratar pences (suprimir duplicadas na união).

### Modellista

Não como peça única; possível combinar rotas manualmente.

---

## 6. Camisa (shirt) — além do bodice

### Elementos adicionais

| Elemento | Técnica específica |
|----------|-------------------|
| **Colarinho + pé de colarinha** | Perímetro decote medido na linha de costura; stand height ~2–3 cm; relação decote recto vs curvo |
| **Punho** | Retângulo + sobreposição botão; ligação à manga |
| **Carcela / patilha** | Extensão frontal; geometria de dobra |
| **Bolsos** | Patch com regra de simetria |
| **Pregas / pences no peito** | Pence no ombro ou prega invertida |

### Modellista

Rota `basic-shirt` reutiliza **mesmo bodice** `basic-blouse`; colarinho formal **não** modelado separadamente no código analisado.

---

## 7. Blusa sem mangas / top (sleeveless)

### Técnica

- Aprofundar cava e decote com regras de **stay** e **binding**.
- Bloco derivado: marcar limites máximos de abertura no bodice block.

### Modellista

Não dedicado; cava atual é para manga.

---

## 8. Casaco / blazer (outerwear block)

### Diferenças vs blusa

- Maior **ease** (sobreposição, camadas).
- Ombro estruturado (alargar linha de ombro).
- Frente com **lapela** (construção geométrica separada).
- Comprimento e recortes de manga diferentes.

### Modellista

Não implementado.

---

## 9. Malha / knit block

### Diferenças

- Folga negativa ou mínima; stretch % nas direções.
- Muitas vezes **sem pence** (drape no tecido).
- Matemática: `% elongação` aplicada na largura do molde.

### Modellista

Não implementado (assume tecido plano rígido implicitamente).

---

## 10. Peças complementares (referência rápida)

| Peça | Medidas-chave | Técnica núcleo |
|------|---------------|----------------|
| Gola militar | Perímetro decote | Retângulo curvo ou pé+aba |
| Gola Peter Pan | Decote | Arco duplo |
| Bainha | Comprimento | Offset paralelo |
| Cós (waistband) | Cintura + elasticidade | Retângulo × altura cós |
| Punho rib | Punho + stretch | % redução |
| Bolso de peito | Posição desde ombro/CF | Simetria |

---

## Matriz: peça × conhecimento Modellista

| Peça básica | Teoria completa | Código Modellista |
|-------------|-----------------|-------------------|
| Bodice frente/costas | ●●● | ●●● |
| Manga set-in | ●●● | ●●○ |
| Saia | ●●● | ○ |
| Calça | ●●● | ○ (grelha) |
| Camisa (colarinho) | ●●○ | ○ |
| Vestido | ●●○ | ○ |
| Graduação | ●●● | ○ |
| Manipulação pences | ●●● | ○ (fixas) |

Legenda: ●●● forte · ●●○ médio · ●○○ fraco · ○ ausente

---

## Leitura cruzada no repositório

| Tópico teórico | Doc implementação |
|----------------|-------------------|
| Sétimos | [03-escala-regra-setimos.md](03-escala-regra-setimos.md) |
| Passo a passo blusa | [04-construcao-blusa-basica.md](04-construcao-blusa-basica.md) |
| Bézier / manga | [05-curvas-bezier-manga.md](05-curvas-bezier-manga.md) |
| Paradigmas | [10-paradigmas-e-metodos.md](10-paradigmas-e-metodos.md) |
| Estruturas dados | [11-matematica-algoritmos-estruturas.md](11-matematica-algoritmos-estruturas.md) |
