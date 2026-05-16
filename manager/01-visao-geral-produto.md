# Visão geral do produto

## Nome e marca

- **Nome interno do pacote Bower:** Modellista (`bower.json`).
- **Descrição no Bower:** Projeto Modellista — CoutureLab.
- **Homepage referenciada:** simstim.com.br.

## O que a aplicação faz

O repositório contém **duas superfícies principais** que trabalham em conjunto no domínio de **moda sob medida / moldes digitais**:

1. **Site marketing e catálogo (SPA)** na raiz do projeto: páginas estáticas e AngularJS com conteúdo dinâmico vindo do **Contentful** (banners, produtos, coleções, texto institucional). Inclui formulário de contacto e fluxo para o utilizador introduzir medidas e abrir o **laboratório de moldes** noutro URL (servidor/backend legado).

2. **Backend Node (Express)** em `backend/`: serve ficheiros estáticos da raiz (`assets`, `core`, `views`, `bower_components`, `template`), renderiza páginas **Jade** para fluxos de **modelagem paramétrica** (medidas na URL), gera **PDF** (PDFKit e fluxos antigos com referências a phantom/request), envia ficheiros para **Amazon S3**, persiste **contactos** em **MySQL**, e lista objetos no bucket.

## Utilizador final (inferido)

- Navega pelo site (home, produtos, sobre, contacto, coleções).
- Consulta detalhe de um modelo (`#/model/:id`) com dados do CMS.
- Pode seguir para ferramentas de geração de molde/PDF através de URLs construídas para o host de desenvolvimento legado (`dev.simstim.com.br`) ou rotas montadas sob o Express atual (`/basic-shirt`, `/pants`, rotas em `/` do `routes/index.js`).

## Domínio de negócio

- **Medidas corporais** codificadas como parâmetros de rota (`width`, `heigth` com typo histórico, `c_width`, `f_width`, `l_sleeve`, etc.).
- **Tipos de peça:** blusa básica (`basic-blouse`, variantes `basic-blouse-2`), camisa (`basic-shirt`, `shirt` em ficheiro não montado), calças (`pants`).
- **Saídas:** PDF, SVG tratado no cliente (`core/basic-blouse.js` com parsing DOM → geometria), upload para S3, listagem de bucket.

## Relação entre pastas e “produto”

- A **experiência pública** típica começa em `index.html` + `core/controllers.js` (hash routes).
- A **experiência técnica de desenho** usa `backend/views/*.jade` + scripts em `backend/public/javascripts/` (Paper.js, RequireJS).
