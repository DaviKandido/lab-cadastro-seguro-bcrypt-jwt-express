# Guia de Desenvolvimento — Projeto Pratico: Rotas de Cadastro e Login Seguro (bcrypt + JWT)

Este guia explica passo a passo como **implementar rotas seguras de cadastro e autenticação** em um projeto Node.js + Express usando **bcrypt** para hashing de senhas e **JSON Web Tokens (JWT)** para autenticação baseada em token. Ele também traz dicas de segurança, exemplos de middlewares, e um exemplo de documentação OpenAPI/Swagger.

---

## Objetivo

Criar rotas REST seguras para:

- **Cadastro de usuário** (`POST /api/auth/register`) — salvar usuário com senha hasheada.
- **Login / Autenticação** (`POST /api/auth/login`) — verificar credenciais e emitir JWT.
- **Rota protegida de exemplo** (`GET /api/profile`) — exige token válido.

---

## Dependências sugeridas

```bash
npm install express bcryptjs jsonwebtoken dotenv knex pg
# opcional para documentação
npm install swagger-ui-express swagger-jsdoc
```

> Use `bcryptjs` por compatibilidade; `bcrypt` (C++) também funciona mas pode exigir build tools.

---

## Variáveis de ambiente (exemplo .env)

```
PORT=3000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=cadastro_db
NODE_ENV=development
```

> **Nunca** commit esse arquivo no repositório — adicione ao `.gitignore`.

---

## Estrutura mínima sugerida

```
src/
 ├── controllers/
 │    └──auth.controller.js
 ├── db/
 │    ├──migrations/
 │    |   └──user.create.js
 │    ├──seeds/
 │    │   └──user.seed.js
 │    └─ db.js
 ├── middlewares/
 │    ├──auth.middleware.js
 │    └──validation.middleware.js
 ├── models/
 │    └──user.model.js
 ├──routes/
 │    └──auth.routes.js
 ├──repository/
 │   └── auth.repository.js
 ├── app.js
 ├── server.js
.env
```

---

## Intancia do nosso docker

Na raiz do projeto defina nossa instancia do postgresQL através do docker, crie o arquivo `docker-compose.yml`, exemplo abaixo:

```yml
services:
  postgres-seguro:
    container_name: postgres-seguro
    image: postgres:17
    restart: unless-stopped
    ports:
      - "5435:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
    driver: local
```

Para subir o banco, execute o comando correspondente ao seu sistema operacional no terminal:

**Windows**

```sh
docker compose up -d #Flag para manter o docker ativo (independente do terminal)
```

**Linux**

```sh
sudo docker compose up -d
```

Caso seja utilizado outras versões do docker talvez seja necessário acrescentar um " - "(hífen) entre os comandos de docker e composer, como exemplificado a baixo:

**Windows**

```sh
docker-compose up -d
```

**Linux**

```sh
sudo docker-compose up -d
```

## Definição do nosso knexfile

Execute o inicializador do knex em seu projeto, vera que um arquivo chamado knexfile sera gerado na raiz do projeto

```sh
npx knex init
```

Faça a configuração de conexão com o nosso banco de dados, no `knexfile.js` faça algo parecido com isso, lembre que estamos usando ES6 então alguns configurações de exportações deve ser alteras, veja:

```js
// mude module.export para export default, crie primeiro const config = {...},
// e o exporte no final do arquivo

import dotenv from "dotenv";
dotenv.config();


/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const config = {
  development: {
    client: "pg",
    connection: {
      host: "127.0.0.1",
      port: 5435,
      user: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD || "postgres",
      database: process.env.POSTGRES_DB || "cadastro_db",
    },
    migrations: {
      directory: "src/db/migrations",
      extension: "js",
    },
    seeds: {
      directory: "src/db/seeds",
    },
  },
  ci: {
    client: "pg",
    connection: {
      host: "postgres",
      port: 5435,
      user: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD || "postgres",
      database: process.env.POSTGRES_DB || "cadastro_db",
    },
    migrations: {
      directory: "src/db/migrations",
      extension: "js",
    },
    seeds: {
      directory: "src/db/seeds",
    },
  },
};

export default config; // exportação por ES6
```

Posterior a isso crie um arquivo chamado `db.js`, dentro da pasta `db/` , que será responsável por fazer justamente essa conexão com nosso banco de dados, veja a baixo:

```js
import knexConfig from "../../knexfile.mjs";
import knex from "knex";

const nodeEnv = process.env.NODE_ENV || "development";
const config = knexConfig[nodeEnv];

const db = knex(config);

export default db;
```

## Execução dos migrations

Antes de iniciar nosso migrations vamos definir a estrutura da tabela de usuário, execute:

```sh
 npx knex migrate:make create_users 
```

Um arquivo chamado `<codigo_de_controle>_create_users.js` será gerado em `db/migrations`, la que definiremos a estrutura da nossa tabela de usuários, veja:

```js

```