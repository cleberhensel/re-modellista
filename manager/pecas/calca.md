# Calça (trouser / pant block)

## Identificação

| Campo | Valor |
|-------|--------|
| Nome técnico | Trouser block / pant sloper |
| Tipo | Bloco inferior complexo |
| Simetria | Frente e costas distintas; espelho L/R |
| Pares de costura | Entrepernas, lateral, gancho, cós |

## Função

Base para calças clássicas, alfaiataria, jeans (com bloco derivado), bermudas.

## Medidas de entrada (teoria)

| Medida | Crítica | Notas |
|--------|---------|-------|
| Cintura | Alta | Pence costas |
| Quadril | Alta | Largura de gancho |
| **Profundidade de gancho (crotch depth)** | **Crítica** | Medida sentado |
| Entrepernas (inseam) | Alta | Comprimento perna interior |
| Lateral (outseam) | Validação | waist→ankle |
| Coxa, joelho, tornozelo | Ajuste | Taper da perna |

## Construção plana — resumo

1. Grelha: quarto de quadril; marcar linha de gancho na profundidade medida.
2. **Extensão gancho frente:** tipicamente `(hip/2)/8` ou tabelas do método.
3. **Extensão gancho costas:** maior (+2 a +4 cm vs frente).
4. Curvas de gancho assimétricas (costas mais longa).
5. Linha de fio em cada perna.
6. Pence(s) na cintura das costas.
7. Ficha de joelho opcional; linha de joelho a 1/3 ou medida direta.

## Fórmulas de referência (literatura)

```
front_crotch_extension ≈ (hip/2) / 8
back_crotch_extension ≈ front_extension + 2..4 cm
waist_front = waist/4 + 1.5 cm (exemplo método europeu)
waist_back = waist/4 + 0.5 cm + dart
```

Gancho ≠ função do busto; **não** reutilizar regra dos sétimos do bodice sem adaptação.

## Derivações

| Estilo | Técnica |
|--------|---------|
| Pantalão largo | Slash lateral |
| Culotte | Slash entrepernas |
| Jeans | Bloco com reforço, bolsos, corte Yoke |
| Chino | Menos ease, bolsos faca |

## Estado Modellista

| Aspeto | Detalhe |
|--------|---------|
| Rota | `GET /pants/pnts/:width/:height/` |
| Módulo | `pants.js`, `pants-front.js` |
| Implementação | Grelha 5×5; `seventh = width/7`; `cast_to_px = ×28.347` |
| Contorno | **Não fecha** molde de calça |
| PDF | `POST /pants/pdf/` espera SVGs (incompleto) |

### Código atual (`pants-front.js`)

- 5 linhas horizontais espaçadas por `seventh.one`.
- 5 linhas verticais.
- Linha superior “vermelha” com offset `2.5 cm`.
- Viewport fixo 1000×1000 px.

## Lacunas para produção

- Sem gancho fechado.
- Sem entrepernas / perna.
- Parâmetros `width`/`height` na rota não mapeiam claramente cintura/gancho.
- Sem costas da calça.

## Roadmap técnico

1. DTO `PantMeasurements` (waist, hip, crotchDepth, inseam, …).
2. `draftPantFront` / `draftPantBack` separados.
3. Validar perímetro gancho F+B simétrico.
4. Unificar escala `28.347` com bodice.

## Referências

- [../modelagem/12-catalogo-pecas-basicas-tecnicas.md](../modelagem/12-catalogo-pecas-basicas-tecnicas.md) §4
- [saia-reta.md](saia-reta.md)
- Wikibooks: Pattern drafting/Pants
