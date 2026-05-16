# Anomalias, legado e segurança

## Credenciais e segredos em código

- **MySQL:** utilizador, palavra-passe e host em texto claro em `backend/routes/index.js` e `core/index.js`. Risco: exposição no Git, logs, e cópias de backup.
- **Contentful:** `accessToken` com permissões de leitura (tipicamente) embutido em `core/controllers.js` — qualquer utilizador do site pode extrair o token no DevTools. Deve usar-se token **preview** apenas em dev ou Content Delivery API com restrições adequadas.
- **Não documentar nem copiar** estes valores para novos ficheiros; rodar **rotação** de credenciais se o repositório foi público.

## Caminhos inconsistentes

- `sendFile` com `root: '../application/'` e ficheiro `index.html` — pasta `application/` **ausente** na árvore atual do repositório. O `index.html` está na raiz. O `GET /` pode falhar até o deploy espelhar a estrutura antiga ou o código ser corrigido.

## Dependências npm incompletas

`backend/package.json` não lista módulos obrigatórios ao arranque (`multer`, `aws-sdk`, etc.). Clone limpo = falhas de `require`.

## Código quebrado ou incompleto

- **`POST /create-file/`** em `routes/index.js`: usa `image`, `svg` sem definição clara no trecho analisado; provável código a meio de refactor.
- **`shirt.js`:** não registado em `app.js` — rota morta.
- **`core/index.js`:** não importado pela app principal — duplicação de manutenção.

## Segurança HTTP / API

- **CORS** `Access-Control-Allow-Origin: *` em tudo — permissivo demais se houver operações sensíveis.
- **GET `/contact`** persiste dados a partir de **query string** — qualquer site pode fazer o browser da vítima disparar pedidos (CSRF leve) e poluir a base de contactos; o método correto seria POST com proteção CSRF e validação.
- **Redirect** pós-contacto para `http://modellista.com.br/` fixo — pode não coincidir com o domínio atual.
- Sem **autenticação** nas rotas de PDF/S3 — qualquer cliente que conheça as URLs pode stressar geração/armazenamento.

## Dependências nativas obsoletas

- **phantom** (PhantomJS) — projeto descontinuado.
- **rsvg** — bindings nativos frágeis.

Migrar para Puppeteer/Playwright ou renderização pura servidor exigiria refactor.

## Dados pessoais (LGPD / GDPR)

A tabela `contact` armazena nome, email, telefone, mensagem. Garantir base legal, retenção e política de privacidade alinhadas ao tratamento atual (hoje implícito no código apenas).

## Typo persistente

`heigth` em vez de `height` em rotas, params e objetos — qualquer API nova deve decidir entre corrigir (breaking change) ou manter para compatibilidade.

## `npm-debug.log`

Não deve estar no controlo de versões; pode conter caminhos locais e indícios do ambiente.

## Resumo de ações recomendadas (fora do âmbito desta doc)

Extrair segredos para variáveis de ambiente, corrigir caminho `application/`, alinhar `package.json`, remover ou integrar `core/index.js` e `shirt.js`, endurecer CORS e métodos de contacto, e auditar exposição Contentful.
