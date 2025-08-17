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
npm install express bcryptjs jsonwebtoken dotenv knex pg zod
# opcional para documentação
npm install swagger-ui-express swagger-jsdoc
```

> Use `bcryptjs` por compatibilidade; `bcrypt` (C++) também funciona mas pode exigir build tools.

---

## Variáveis de ambiente (exemplo .env)

```bash
PORT=3000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=cadastro_db
NODE_ENV=development
```

> **Nunca** commit esse arquivo no repositório — adicione ao `.gitignore`.

---

## Estrutura mínima sugerida

```bash
src/
 ├── controllers/
 │    ├──auth.controller.js
 │    └──profile.controller.js
 ├── db/
 │    ├──migrations/
 │    |   └──user.create.js
 │    ├──seeds/
 │    │   └──user.seed.js
 │    └─ db.js
 ├── docs/
 │    └── swagger.docs.json
 ├── middlewares/
 │    ├──auth.middleware.js
 │    └──validateSchema.middleware.js
 ├── models/
 │    └──user.model.js
 ├──routes/
 │    ├──auth.routes.js
 │    └──profile.routes
 ├──repository/
 │   └── user.repository.js
 ├──utils/
 │   ├── errorHandler.util.js
 │   └── zodSchemas.util.js
 ├── app.js
 ├── server.js
.env
docker-compose.yml
knexfile.msj
```

---

## Instância do nosso docker

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

Caso seja utilizado outras versões do docker talvez seja necessário acrescentar um " - "(hífen) entre os comandos de docker e composer, como exemplificado abaixo:

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

> Lembre-se que estamos utilizando ES6, estão como boa pratica alteraremos o nome do nosso arquivo de `knexfile.js` para `knexfile.mjs`

Faça a configuração de conexão com o nosso banco de dados, no `knexfile.mjs` faça algo parecido com isso, lembre que estamos usando ES6 então alguns configurações de exportações deve ser alteradas, veja:

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

Posterior a isso crie um arquivo chamado `db.js`, dentro da pasta `db/` , que será responsável por fazer justamente essa conexão com nosso banco de dados, veja abaixo:

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

Um arquivo chamado `<codigo_de_controle>_create_users.js` será gerado em `db/migrations`, onde definiremos a estrutura da nossa tabela de usuários, veja:

```js
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  return await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("email").unique().notNullable();
    table.string("password").notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  return await knex.schema.dropTable("users");
};
```

> Veja que também foi necessário adaptações para que o migrations comportasse com ES6

Em seguida basta executar o migrations:

```sh
 npx knex migrate:latest
```

---

## Execução das seeds

Também definiremos seeds para popular nosso banco com alguns usuários iniciais, eles serão importantes para explicarmos como a inclusão das bibliotecas de criptografia atuarão sobre os novos registros, execute:

```sh
npx knex seed:make user.seed
```

Veja que um arquivo chamado `user.seed.mjs` será gerado em `src/db/seeds`, que será onde incluiremos usuários de exemplo, veja:

```js
export const seed = async (knex) => {
  // Deletes ALL existing entries
  await knex("users").del();

  // Inserts seed entries
  await knex("users").insert([
    {
      name: "Alice Souza",
      email: "alice@example.com",
      password: "hashed_password_1",
    },
    {
      name: "Bruno Lima",
      email: "bruno@example.com",
      password: "hashed_password_2",
    },
    {
      name: "Carla Mendes",
      email: "carla@example.com",
      password: "hashed_password_3",
    },
  ]);
};
```

---

## Automatizando Comando Padrões via package.json

Uma boa prática para projetos back-end node é armazenar/criar scripts que serão executados recorrentemente em nosso servidor para isso criaremos em nosso `package.json`, uma seção de scripts comuns, veja:

## 💻 Versão para Linux

```json
{
  "name": "bcrypt_e_jwt_with_express",
  "version": "1.0.0",
  "description": "",
  "main": "app.js",
  "scripts": {
    "dev": "node --watch src/server.js",
    "db:cli": "sudo docker exec -it postgres-seguro psql -U postgres -d cadastro_db",
    "db:reset": "npm run db:drop && npm run db:create && npm run db:migrate && npm run db:seed",
    "db:drop": "sudo docker exec -it postgres-seguro psql -U postgres -c 'DROP DATABASE IF EXISTS cadastro_db;'",
    "db:create": "sudo docker exec -it postgres-seguro psql -U postgres -c 'CREATE DATABASE cadastro_db;'",
    "db:migrate": "npx knex migrate:latest ",
    "db:seed": "npx knex seed:run"
  },
 ...
}
```

Segue uma tabela explicando cada script e depois a versão adaptada para **Windows** (PowerShell ou CMD), já que no Windows o `sudo` e o `-it` do Docker podem causar problema.

---

## 📋 Tabela de scripts

| Script          | Comando                                                                                           | Função                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **dev**         | `node --watch src/server.js`                                                                      | Inicia o servidor em modo de desenvolvimento e reinicia automaticamente quando arquivos mudam.                   |
| **db\:cli**     | `sudo docker exec -it postgres-seguro psql -U postgres -d cadastro_db`                            | Abre o terminal interativo do PostgreSQL dentro do container `postgres-seguro` conectado ao banco `cadastro_db`. |
| **db\:reset**   | `npm run db:drop && npm run db:create && npm run db:migrate && npm run db:seed`                   | Reseta todo o banco: apaga, recria, aplica migrations e popula dados iniciais.                                   |
| **db\:drop**    | `sudo docker exec -it postgres-seguro psql -U postgres -c 'DROP DATABASE IF EXISTS cadastro_db;'` | Remove o banco `cadastro_db` (se existir).                                                                       |
| **db\:create**  | `sudo docker exec -it postgres-seguro psql -U postgres -c 'CREATE DATABASE cadastro_db;'`         | Cria o banco `cadastro_db`.                                                                                      |
| **db\:migrate** | `npx knex migrate:latest`                                                                         | Executa todas as migrations pendentes para criar/alterar tabelas.                                                |
| **db\:seed**    | `npx knex seed:run`                                                                               | Executa os seeds para popular o banco com dados iniciais.                                                        |

---

## 💻 Versão para Windows

No Windows (PowerShell ou CMD) você pode remover `sudo` e, caso `-it` dê problema, usar apenas `docker exec`.
Aqui está a versão adaptada:

```json
{
  "scripts": {
    "dev": "node --watch src/server.js",
    "db:cli": "docker exec -it postgres-seguro psql -U postgres -d cadastro_db",
    "db:reset": "npm run db:drop && npm run db:create && npm run db:migrate && npm run db:seed",
    "db:drop": "docker exec -it postgres-seguro psql -U postgres -c \"DROP DATABASE IF EXISTS cadastro_db;\"",
    "db:create": "docker exec -it postgres-seguro psql -U postgres -c \"CREATE DATABASE cadastro_db;\"",
    "db:migrate": "npx knex migrate:latest",
    "db:seed": "npx knex seed:run"
  }
}
```

> ⚠ **Dicas para Windows**
>
> - Use **aspas duplas** (`"`) dentro do comando `psql -c` para evitar problemas no CMD.
> - No **PowerShell**, se der erro com aspas, use **aspas simples fora** e **duplas dentro** ou escape (`\`) corretamente.
> - Se precisar rodar sem interação, troque `-it` por apenas `-i` ou remova.

---

# Desenvolvimento das Rotas de Cadastro e login

### Repositories

Iniciaremos pela ordem "inversa", começaremos criando o arquivo de repositório que será responsável por acessar o banco de dados e retornar os usuários, enviar e buscar dados para realizar o login ou realizar o cadastro de um novo usuário. Pra isso crie em `repositories`um arquivo chamado `user.repository.js`.

```js
import db from "../db/db.js";

const userRepository = {
  findUserByEmail: async (email) => {
    return await db("users").where("email", email).first();
  },

  findUserById: async (id) => {
    return await db("users").where({ id: id }).first();
  },

  insertUser: async (user) => {
    return await db("users").insert(user).returning("*");
  },

  updateUser: async (id, user) => {
    return await db("users").where("id", id).update(user).returning("*");
  },

  deleteUser: async (id) => {
    return await db("users").where("id", id).del();
  },
};

export default userRepository;
```

### Controllers

Quanto aos nossos controlles iremos gerar um arquivo chama `auth.controller.js` em `src/controllers`, com a seguinte estrutura:

```js
import userRepository from "../repositories/user.repository.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ApiError from "../utils/errorHandler.util.js";

// Secret key for JWT
const SECRET = process.env.JWT_SECRET || "secret";

// Controllers
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userRepository.findUserByEmail(email);

    if (!user) {
      return next(
        new ApiError("User not found", 404, {
          email: "User not found",
        })
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(
        new ApiError("Invalid password", 401, {
          password: "Invalid password",
        })
      );
    }

    const token = jwt.sign({ id: user.id, user: user.name, email: user.email }, SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "User logged in successfully",
      token: token,
    });
  } catch (error) {
    next(new ApiError("Error logging in", 400, error.message));
  }
};
```

```js
const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await userRepository.findUserByEmail(email);

    if (user) {
      return next(
        new ApiError("User already exists", 400, {
          email: "User already exists",
        })
      );
    }
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS) || 10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userRepository.insertUser({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    next(new ApiError("Error creating user", 400, error.message));
  }
};

export default {
  login,
  signUp,
};
```

### Routes

Agora iremos definir o arquivo de rotas, `auth.routes.js` e o chamaremos em nosso `app.js`, segue o exemplo abaixo:

```js
import express from "express";
import authController from "../controllers/auth.controller.js";
import { signUpSchema, loginSchema } from "../utils/zodSchemas.util.js";
import validateSchema from "../middlewares/validateSchemas.middleware.js";

const router = express.Router();

router.post("/register", validateSchema(signUpSchema), authController.signUp);
router.post("/login", validateSchema(loginSchema), authController.login);

export default router;
```

Também aproveitaremos para já deixar definida uma rota protegida que logo em seguida implementaremos tal proteção:

```js
import express from "express";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(
    `${new Date().toLocaleString()} | Requisição: ${req.method} ${req.url}`
  );
  next();
});

import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";

// Rotas

// Rotas de autenticação - cadastro e login
app.use("/api/auth", authRoutes);

// Rota protegida - exige token válido
app.use("/api/profile", profileRoutes);

export default app;
```

---

# Desenvolvimento de Rota Protegida

# Middleware de Autenticação

Para a proteção de rotas a primeira coisa que teremos que fazer é a criação de um middleware que será responsável por essa proteção, validando ou não o token passado pelo usuário

```js
import jwt from "jsonwebtoken";
import ApiError from "../utils/errorHandler.util.js";

function authMiddleware(req, res, next) {
  try {
    // Pega o token do header
    const tokenHeader = req.headers.authorization;

    // Verifica se o token existe - se não, retorna erro
    const token = tokenHeader && tokenHeader.split(" ")[1];

    if (!token) {
      return next(
        new ApiError("Token not found", 401, { token: "Token not found" })
      );
    }

    // Verifica se o token é valido - se não, retorna erro
    jwt.verify(token, process.env.JWT_SECRET || "secret", (error, decoded) => {
      if (error) {
        return next(
          new ApiError("Error authenticating user", 401, error.message)
        );
      }
      // Se o token é valido, adiciona o user ao request
      req.user = decoded;

      // Continua para a rota seguinte
      next();
    });
  } catch (error) {
    return next(new ApiError("Error authenticating user", 401, error.message));
  }
}

export default authMiddleware;
```

# Controller Protegido

Agora iremos criar um controller que retornara dados do usuário se o token for válido, segue o exemplo abaixo:

```js
import ApiError from "../utils/errorHandler.util.js";

// Controllers
const getProfile = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return next(
        new ApiError("Users not found", 404, {
          user: "Users not found",
        })
      );
    }

    res.status(200).json(user);
  } catch (error) {
    next(new ApiError("Error getting Profile user", 500, error.message));
  }
};

export default {
  getProfile,
};
```

# Rota Protegido

Portanto para implementar essa proteção, ou seja garantirmos que somente usuarios logados possam acessar essa rota, basta adicionar o middleware de autenticação entre o inicio da rota e o final da rota, ou seja entre `/api/profile` e `getProfile`, segue o exemplo abaixo:

```js
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import profileController from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/", authMiddleware, profileController.getProfile);

export default router;
```

# Documentação OpenAPI/Swagger

Agora como bonus iremos implementar uma documentação OpenAPI/Swagger que aborde as nossas rotas com atributos que indiquem se a rota precisa de autenticação, crie um arquivo chamado `swagger.docs.js` em `src/docs` e segue o exemplo abaixo:

```js
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

const app = express();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cadastro de Usuários",
      version: "1.0.0",
    },
  },
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsDoc(options);

app.use("/", swaggerUi.serve, swaggerUi.setup(specs));

export default app;
```

# Documentando as Rotas

Agora iremos documentar as nossas rotas, segue o exemplo abaixo:

- Rotas de Autenticação:

```js
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Davi Cândido"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@email.com"
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *             required:
 *               - nome
 *               - email
 *               - senha
 *     responses:
 *       '201':
 *         description: Usuário criado com sucesso
 *       '400':
 *         description: Dados inválidos
 */
router.post("/register", validateSchema(signUpSchema), authController.signUp);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Realiza login e retorna JWT
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@email.com"
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *             required:
 *               - email
 *               - senha
 *     responses:
 *       '200':
 *         description: Login realizado com sucesso, retorna token JWT
 *       '401':
 *         description: Credenciais inválidas
 */
router.post("/login", validateSchema(loginSchema), authController.login);
```

- Rota Protegida:

```js
/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @openapi
 * /api/profile:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     tags:
 *       - Autenticação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Perfil do usuário retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 nome:
 *                   type: string
 *                   example: "Davi Cândido"
 *                 email:
 *                   type: string
 *                   example: "usuario@email.com"
 *       '401':
 *         description: Token inválido ou não fornecido
 *       '404':
 *         description: Usuário não encontrado
 */
router.get("/", authMiddleware, profileController.getProfile);
```

---

# O que fizemos?

- **Criptografia de Senha**: Usamos `bcrypt` para criptografia de senhas.
- **Autenticação**: Usamos `JSON Web Tokens (JWT)` para autenticação baseada em token.
- **Documentação**: Usamos `swagger-jsdoc` e `swagger-ui-express` para documentação OpenAPI/Swagger.
- **Middlewares**: Usamos middlewares para tratamento de erros assíncronos.
- **Dependências**: Usar `npm` para gerenciamento de dependências e versões.


## Checklist de segurança rápida

* [ ] Senha hasheada com salt
* [ ] Token com expiração definida
* [ ] Validação dos dados de entrada
* [ ] Armazenamento seguro das chaves (vault, variáveis de ambiente)

# Dicas de Projeto Para ir Além

- **Testes**: Usar `jest` e `supertest` para testes unitários.
- **Linting**: Usar `eslint` para linting (verificação de erros e padronização) de código.
- **Formatação**: Usar `prettier` para formatação de código.

---

## Erros comuns e como resolver

* **Senha comparada incorretamente** — lembre de usar `await bcrypt.compare(...)`.
* **Token inválido** — verifique `JWT_SECRET` consistente entre emissão e verificação.
* **CORS** — configure CORS se cliente e API rodarem em origens diferentes.
* **Problemas com env** — confirme variáveis carregadas via `dotenv.config()`.

---

## Testes e inspeção

* Teste endpoints com **Postman** ou **Insomnia**.
* Teste o fluxo:

  1. `POST /api/auth/register` — criar usuário
  2. `POST /api/auth/login` — receber token
  3. `GET /api/profile` com header `Authorization: Bearer <token>` — acessar rota protegida
* Escreva testes automatizados (jest + supertest) cobrindo cenários: cadastro duplicado, login inválido, token expirado, acesso sem token.

---
# Contato

* 📧 **Email:** [davicandidopucminas@gmail.com](mailto:davicandidopucminas@gmail.com)
* 💼 **LinkedIn:** [www.linkedin.com/in/davi-candido-de-almeida](www.linkedin.com/in/davi-candido-de-almeida)
* 🐙 **GitHub:** [github.com/DaviKandido](https://github.com/DaviKandido)


