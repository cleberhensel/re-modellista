# Casaco / blazer (outerwear block)

## Identificação

| Campo | Valor |
|-------|--------|
| Nome técnico | Jacket block / coat block |
| Tipo | Bloco derivado do bodice |
| Complexidade | Alta (estrutura + lapela) |

## Função

Casacos, blazers, sobretudos; sobreposição sobre roupa com ease adicional.

## Diferenças vs blusa básica

| Aspeto | Blusa | Casaco |
|--------|-------|--------|
| Ease | Mínimo (vestir) | +3 a +8 cm ou mais no busto |
| Ombro | Natural | Alargado para estrutura / ombreira |
| Comprimento | Até cintura/quadril | Variável (quadril, joelho) |
| Frente | Simples | Lapela, sobreposição, botões |
| Manga | Set-in padrão | Manga com mais ease no bíceps |
| Forro | Opcional | Quase sempre (molde duplicado) |

## Medidas adicionais

- Largura de peito com garment underneath.
- Comprimento total casaco.
- Largura de ombro com estrutura.
- Posição de botões e bolsos.

## Técnica (resumo)

1. Partir do bodice com **ease de desenho** explícito.
2. Draft lapela: ângulo de abertura, linha de quebra, roll line.
3. Ajustar ombro e cava para camada exterior.
4. Manga com ease no bíceps e cabeça maior.
5. Forro: cópia reduzida com folga de vestir negativa leve.

## Matemática

```
C_pattern = C_body + E_wearing + E_design + E_layering
```

Lapela: construção por **reflexão** da linha de abertura e ponto de gola.

## Estado Modellista

**Não implementado.** Sem rotas, sem módulos.

## Peças relacionadas no catálogo

- [blusa-frente.md](blusa-frente.md) — base teórica
- [manga.md](manga.md)
- [complementares.md](complementares.md) — bolsos

## Prioridade produto

Baixa face a bodice+camisa; alta se expansão para alfaiataria.
