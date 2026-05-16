# Manipulação de pences, folgas e graduação (aprofundamento)

## Pences — teoria geométrica

### O que é uma pence

Triângulo de supressão de tecido entre duas retas que se encontram no **apex**. Converte convexidade do corpo em costura.

```
Área removida = (1/2) × |AB| × h_perpendicular
```

No bloco clássico, a soma das pences na cintura ≈ diferença entre **quadril** e **cintura** (por quarto de molde).

### Localizações padrão no bodice

| Pence | Frente | Costas |
|-------|--------|--------|
| Cintura | Sim (menor) | Sim (maior) |
| Lateral | Comum | Menos comum |
| Ombro | Opcional (busto) | — |
| Cava | Raramente no sloper | — |

**Apex frente:** próximo do ponto alto do busto (PA), ~2–3 cm lateral e superior ao mamilo.  
**Apex costas:** zona omoplata.

### Manipulação sem alterar fit

**Princípio de conservação:** área angular em torno do apex mantém-se.

| Método | Operação | Uso |
|--------|----------|-----|
| Pivot | Rodar folha fechando pence A, abrindo B | Mover pence para ombro/cava |
| Slash | Cortar até apex, separar | Princess seam, paneis |
| Combine | Fechar múltiplas → uma | Estilo com uma pence só |

Transformações em CAD = rotação de vértices com constraint no apex.

### Modellista

Pences **fixas** na cintura/lateral (`centerLinePence`, `rightSidePence`, `leftSidePence`); **sem** API de manipulação. Profundidade `12 cm`, abertura `3 cm` na base — constantes hardcoded.

---

## Folgas (ease) — detalhe

### Fórmula expandida por zona

```
C_bust_pattern = B/2 + E_wear_bust + E_design_bust   (meio corpo; em blocos de quarto divide-se)
```

Valores orientativos **tecidos planos** (literatura):

| Zona | Wearing ease (total bust) | Design (extra, fitted→loose) |
|------|---------------------------|----------------------------|
| Busto | +5 a +10 cm | +0 a +15 cm |
| Cintura | +2,5 a +5 cm | variável |
| Quadril | +5 cm | +0 a +10 cm |

### Ease na manga

| Conceito | Descrição |
|----------|-----------|
| **Cap ease** | Excesso no perímetro da cabeça vs cava |
| **Bicep ease** | Largura no braço |
| **Wrist** | Punho + folga botão |

Distribuição: mais ease na frente da cabeça (~2/3) que nas costas.

### Onde o Modellista embute folga

| Constante código | Papel provável |
|------------------|----------------|
| `+ oneCmInPx` em ombro/cava | Margem / wearing |
| `7 * oneCmInPx` descida cava p2 | Profundidade cava (não só ease) |
| `+ 5 cm` em `widthFist` | Folga punho + botão |
| Linhas tracejadas offset 1 cm | **Seam allowance**, não ease de vestir |

---

## Graduação (grading)

### Objetivo

Produzir tamanhos S–XL a partir de um **size base** sem redraft manual.

### Mecânica

1. Identificar **pontos cardinais** (ombro, cava, cintura lateral, etc.).
2. Para cada salto de tamanho Δsize: aplicar `(ΔX_i, ΔY_i)` por ponto.
3. Verificar coerência: soma de quartos = incremento total de circunferência.

### Regras típicas (indústria US)

Incrementos por 2" (5 cm) entre tamanhos no busto total não são uniformes em todas as marcas; regras são **proprietárias**.

### Nested grading

Regras do **bloco básico** propagam-se para estilos derivados (pesquisa JFBI / CAD).

### Modellista

**Ausente.** Apenas molde custom por medidas absolutas na URL.

---

## Equalização de curvas (quality)

Checklist industrial:

1. Medir **linha de costura** da cava frente + costas.
2. Medir cabeça da manga na mesma linha.
3. `Δ = L_manga - L_cava` dentro da faixa de ease.
4. Verificar tangência na entrada da cava (ângulo de entrada ~90° ± tolerância).

Garmenta e literatura alertam: medir **cut line** com margem distorce arcos convexos.

---

## Roadmap teórico → produto Modellista v2

| Capacidade teórica | Prioridade para paridade |
|--------------------|--------------------------|
| Bodice paramétrico testado | Alta (já existe) |
| `E_cap` explícito | Alta |
| Calça com gancho | Alta |
| Saia reta | Média |
| Manipulação pences | Média (produto) |
| Grading | Baixa (outro produto) |
| Colarinho camisa | Média |
