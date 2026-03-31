# Projeto Banco de Dados - Loja de Materiais de Construção

Aplicação acadêmica da disciplina Banco de Dados 2026.1 com modelagem relacional, backend Java em JDBC e interface web para operar o catálogo e as vendas da loja.

## Stack oficial

- Backend: Java 21, Spring Boot, JDBC puro e SQL manual
- Frontend: React, Vite e JavaScript
- Banco de dados: PostgreSQL
- Modelagem: brModelo Desktop

## Arquitetura

Fluxo principal do sistema:

`Frontend React -> API Java Spring Boot -> DAO JDBC -> PostgreSQL`

Resumo das responsabilidades:

- Frontend: exibe a interface e envia as ações do usuário para a API
- Controllers: recebem as requisições HTTP e devolvem respostas em JSON
- DAOs: executam os comandos SQL no banco
- PostgreSQL: armazena os dados e aplica as regras de integridade

## Estrutura

- `apps/backend`: API REST oficial da entrega web
- `apps/frontend`: interface web da aplicação
- `.env`: configuração local do banco usada pelo backend e pelo script de reset
- `.env.example`: modelo da configuração local
- `scripts/start-db.ps1`: inicia o serviço local do PostgreSQL no Windows
- `scripts/reset-db.ps1`: lê o `.env`, recria o schema do banco configurado e reaplica os scripts SQL
- `sql/01_create_schema.sql`: criação do esquema relacional
- `sql/02_insert_data.sql`: carga inicial do banco

## Como rodar

1. Inicie o PostgreSQL local:

```powershell
.\scripts\start-db.ps1
```

2. Crie um arquivo local `.env` na raiz usando `.env.example` como referência.

3. Se precisar recriar e popular a base:

```powershell
.\scripts\reset-db.ps1
```

4. Com o PostgreSQL rodando na porta `5432`, execute:

```powershell
npm run dev
```

Esse comando sobe o backend em `http://localhost:8080` e o frontend em `http://localhost:5173`.

Exemplo de `.env`:

```powershell
DB_URL=jdbc:postgresql://localhost:5432/loja_materiais
DB_USER=postgres
DB_PASSWORD=postgres
```

O `reset-db.ps1` também lê esse mesmo `.env`, então não é necessário repetir a senha na linha de comando. O script usa os dados do `DB_URL`, `DB_USER` e `DB_PASSWORD` para localizar o banco e aplicar o reset.

## Carga inicial

Os scripts SQL deixam a base pronta para demonstração e testes locais. Eles inserem dados de referência do projeto, como categorias, clientes, atendentes, produtos, vendas e demais registros do modelo para que o sistema já abra com informações disponíveis.

## Backend

O backend usa Spring Boot apenas como camada web da API. Ele cuida do servidor HTTP, roteamento, JSON, validação básica e CORS. O acesso ao banco continua em JDBC puro, sem ORM.

Pastas importantes:

- `src/main`: código-fonte real da API
- `src/test`: testes automatizados, quando existirem

O backend lê `DB_URL`, `DB_USER` e `DB_PASSWORD` automaticamente do `.env` da raiz do projeto. No `npm run dev`, a variável `FRONTEND_ORIGIN` é definida para liberar o frontend local.

Build do backend:

- `npm run build:backend`

Endpoints principais:

- `GET /api/categorias`
- `GET /api/clientes`
- `GET /api/atendentes`
- `GET/POST/PUT/DELETE /api/produtos`
- `GET/POST/PUT/DELETE /api/vendas`

## Frontend

No `npm run dev`, o frontend usa `VITE_API_URL=http://localhost:8080/api`.

Pastas importantes:

- `src`: código-fonte real da interface

Build do frontend:

- `npm run build:frontend`

## Escopo da interface

A interface web foi feita para operar principalmente duas áreas da entrega:

- `produtos`: cadastro, edição, exclusão, listagem e busca
- `vendas`: cadastro, edição, exclusão, listagem e busca

Além disso, a tela também consulta:

- `categorias`: para preencher o formulário de produtos
- `clientes`: para preencher o formulário de vendas
- `atendentes`: para preencher o formulário de vendas

As demais tabelas do banco fazem parte da modelagem e da integridade dos dados, mas não possuem CRUD próprio na interface atual.

## Arquivos principais

- `apps/frontend/src/Aplicacao.jsx`: concentra o estado principal da interface e coordena as seções de produtos e vendas
- `apps/frontend/src/lib/clienteBackend.js`: centraliza as chamadas HTTP do frontend para a API
- `apps/backend/src/main/java/br/com/cesar/projetobd/backend/controller/ProdutoController.java`: recebe as requisições HTTP do CRUD de produtos
- `apps/backend/src/main/java/br/com/cesar/projetobd/backend/dao/VendaDao.java`: executa os comandos SQL ligados às vendas
- `sql/01_create_schema.sql`: cria o esquema relacional do banco
- `sql/02_insert_data.sql`: insere a carga inicial usada na demonstração

## Fluxo dos dados

O fluxo principal funciona assim:

1. O usuário preenche a tela no frontend.
2. O frontend envia a requisição para a API.
3. O controller recebe a requisição e chama o DAO correspondente.
4. O DAO executa o SQL no PostgreSQL.
5. O banco devolve o resultado.
6. A API responde em JSON para o frontend.
7. O frontend atualiza a tela com os dados retornados.

## Observações

- A arquitetura oficial da entrega fica em `apps/`.
- O frontend consome a API Java por uma camada única de cliente HTTP em `apps/frontend/src/lib/clienteBackend.js`.
- O ambiente esperado é Windows com `java`, `npm` e PostgreSQL disponíveis localmente.
- O `npm run dev` sobe apenas backend e frontend. O banco deve ser iniciado antes, usando o serviço local do PostgreSQL na porta `5432`.
- O `npm run dev` lê o `.env` automaticamente na raiz do projeto.
