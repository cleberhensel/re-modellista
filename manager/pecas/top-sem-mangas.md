# Top / blusa sem mangas (sleeveless bodice)

## Identificação

| Campo | Valor |
|-------|--------|
| Nome técnico | Sleeveless bodice / top block |
| Tipo | Derivação do bodice |
| Simetria | Como blusa |

## Função

Tops, coletes, blusas de alças, base para vestidos sem manga.

## Relação com blusa com manga

Parte do **mesmo bodice**; alterações:

| Zona | Alteração |
|------|-----------|
| Cava | Aprofundada (mais curva, mais área) |
| Decote | Pode ampliar (regras de modéstia/estrutura) |
| Ombro | Pode estreitar ou virar alça |
| Acabamento | Bias binding, viés, forro |

## Medidas

Iguais ao bodice: busto, comprimento, cintura, quadril.  
Sem `l_sleeve` / punho de manga.

## Técnica

1. Draft bodice front/back padrão.
2. Marcar nova linha de cava (tipicamente 1–3 cm para dentro do braço vs blusa com manga — método depende).
3. Validar perímetro decote + cava para acabamento.
4. Eliminar peça manga.

## Matemática

Não há cabeça de manga; constraint principal:

```
Perímetro_cava_sleeveless > Perímetro_cava_com_manga (tipicamente)
```

Sem igualação a `L_armhole` de manga.

## Estado Modellista

| Aspeto | Estado |
|--------|--------|
| Bloco dedicado | **Não** |
| Cava atual | Desenhada para manga set-in |
| Rota | Nenhuma |

## Migração

- Parâmetro `sleeveless: boolean` em `draftBodice`.
- Ou peça catalogada `top` com offset de cava documentado.

## Referências

- [blusa-frente.md](blusa-frente.md)
- [blusa-costas.md](blusa-costas.md)
