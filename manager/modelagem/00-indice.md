# Modelagem paramétrica — índice da documentação

Análise profunda do fluxo de **desenho / modelagem de moldes** no repositório `modelista-completo`. Foco em matemática, algoritmos, técnicas de construção plana (flat pattern) e pipeline de saída (SVG → PDF).

| Ficheiro | Conteúdo |
|----------|----------|
| [01-visao-geral-e-fluxos.md](01-visao-geral-e-fluxos.md) | Onde vive a feature, fluxos end-to-end, peças suportadas |
| [02-parametros-e-medidas.md](02-parametros-e-medidas.md) | Entradas do utilizador, mapeamento URL ↔ `config`, typos legados |
| [03-escala-regra-setimos.md](03-escala-regra-setimos.md) | Conversão cm↔px, regra do 1/7 do busto, fórmulas exatas |
| [04-construcao-blusa-basica.md](04-construcao-blusa-basica.md) | Retângulos guia, ombro, cava, gola, pences, fio |
| [05-curvas-bezier-manga.md](05-curvas-bezier-manga.md) | Cava “curva francesa”, costas, manga, `addHandles` |
| [06-exportacao-svg-pdf.md](06-exportacao-svg-pdf.md) | `translateSvg`, PDFKit, S3, margens de costura tracejadas |
| [07-pecas-rotas-modulos.md](07-pecas-rotas-modulos.md) | Blusa, camisa, calças; rotas Express; ficheiros por peça |
| [08-inventario-codigo.md](08-inventario-codigo.md) | Lista de ficheiros, duplicações, versões ativas vs backup |
| [09-inconsistencias-riscos.md](09-inconsistencias-riscos.md) | Bugs de mapeamento, constantes divergentes, código morto |
| [14-validacao-motor-vs-legado.md](14-validacao-motor-vs-legado.md) | Divergências motor TS vs `basic-blouse.js` e correções |
| [10-paradigmas-e-metodos.md](10-paradigmas-e-metodos.md) | **Pesquisa:** flat pattern, draping, blocos, CAD paramétrico |
| [11-matematica-algoritmos-estruturas.md](11-matematica-algoritmos-estruturas.md) | **Pesquisa:** escalas, Bézier, arco, estruturas de dados |
| [12-catalogo-pecas-basicas-tecnicas.md](12-catalogo-pecas-basicas-tecnicas.md) | **Pesquisa:** catálogo de peças básicas e técnicas por peça |
| [13-manipulacao-pences-graduacao-folgas.md](13-manipulacao-pences-graduacao-folgas.md) | **Pesquisa:** pences, folgas, graduação, equalização |

**Motor gráfico:** [Paper.js](https://paperjs.org/) no browser (canvas + export SVG).  
**Empacotamento legado:** RequireJS em `backend/public/javascripts/`; variante AMD em `module-basic-blouse.js`.

**Catálogo por peça (fichas individuais):** [../pecas/00-indice.md](../pecas/00-indice.md)
