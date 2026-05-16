# Execução, build e ambiente

## Pré-requisitos inferidos

- Node.js compatível com Express 4.13 (idealmente LTS antigo se dependências nativas forem usadas).
- npm para dependências do `backend/`.
- Bower global ou via `npx bower` para popular `bower_components/` na raiz.
- MySQL acessível se rotas de contacto/produtos forem usadas.
- Credenciais AWS configuradas no ambiente se uploads S3 forem testados.

## Instalação

1. Na **raiz** do repositório: instalar dependências Bower conforme `bower.json` (comando típico: `bower install`). Isto cria `bower_components/` referenciado por `index.html` e pelos estáticos Express.

2. Em **`backend/`:** `npm install`. **Atenção:** o `package.json` pode não instalar tudo o que `require()` precisa — instalar manualmente pacotes em falta (`multer`, `aws-sdk`, `mysql`, `underscore`, `pdfkit`, etc.) até a app arrancar sem `Cannot find module`.

## Arranque do servidor

```bash
cd backend && npm start
```

Equivale a `node ./bin/www`. Porta **3000** se `PORT` não estiver definida.

## Variáveis de ambiente

| Nome | Uso |
|------|-----|
| `PORT` | Porta HTTP (`backend/bin/www`). |
| `NODE_ENV` | Modo Express (`development` vs produção) para handlers de erro. |
| `DEBUG` | Opcional, para logs `debug('backend:server')`. |
| Variáveis AWS padrão | Se aplicável (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, etc.) — não listadas no repositório. |

## Build de front-end

Não há script `npm run build`. O LESS em `assets/css/styles.less` pode ser compilado manualmente para `styles.css` fora do pipeline do repo.

## Servir a SPA

Cenários possíveis:

- **Desenvolvimento:** abrir `index.html` diretamente do disco **pode falhar** em chamadas AJAX/CORS; o modo suportado pelo projeto é servir via Express para prefixos `/assets`, `/core`, `/views` corretos com o mesmo origin.

- **Produção:** normalmente o Express na raiz lógica do deploy; o `GET /` em `routes/index.js` espera `application/index.html` — alinhar estrutura de pastas ou alterar `root`/`sendFile`.

## Ficheiros a não versionar em produção

- `backend/npm-debug.log` presente no repositório — artefacto de depuração npm, deve ser ignorado em futuros `.gitignore`.

## Testes

Não há pasta `test/`, Jest, Mocha, nem scripts `npm test` no `package.json`.
