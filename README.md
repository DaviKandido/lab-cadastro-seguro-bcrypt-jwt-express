# Guia de Desenvolvimento — Rotas de Cadastro Seguro (bcrypt + JWT)

Este guia explica passo a passo como **implementar rotas seguras de cadastro e autenticação** em um projeto Node.js + Express usando **bcrypt** para hashing de senhas e **JSON Web Tokens (JWT)** para autenticação baseada em token. Ele também traz dicas de segurança, exemplos de middlewares, e um exemplo de documentação OpenAPI/Swagger.

---

## Objetivo

Criar rotas REST seguras para:

* **Cadastro de usuário** (`POST /api/auth/register`) — salvar usuário com senha hasheada.
* **Login / Autenticação** (`POST /api/auth/login`) — verificar credenciais e emitir JWT.
* **Rota protegida de exemplo** (`GET /api/profile`) — exige token válido.

---

## Dependências sugeridas

```bash
npm install express bcryptjs jsonwebtoken dotenv express-validator
# opcional para documentação
npm install swagger-ui-express swagger-jsdoc
```

> Use `bcryptjs` por compatibilidade; `bcrypt` (C++) também funciona mas pode exigir build tools.

---

## Variáveis de ambiente (exemplo .env)

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/meubanco
JWT_SECRET=uma_chave_secreta_super_forte
JWT_EXPIRES_IN=1d # ou '2h'
BCRYPT_SALT_ROUNDS=10
```

**Nunca** commit esse arquivo no repositório — adicione ao `.gitignore`.

---

## Estrutura mínima sugerida

```
src/
  controllers/
    auth.controller.js
  middlewares/
    auth.middleware.js
    validation.middleware.js
  models/
    user.model.js
  routes/
    auth.routes.js
  services/
    auth.service.js
  app.js
.env
```

---

## Exemplo: Model de usuário (Mongoose)

```js
// src/models/user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  senha: { type: String, required: true },
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
```

---

## Serviço de autenticação (hash + jwt)

```js
// src/services/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';

async function hashSenha(senha) {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(senha, salt);
}

async function compararSenha(senha, hash) {
  return bcrypt.compare(senha, hash);
}

function gerarToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}

module.exports = { hashSenha, compararSenha, gerarToken };
```

---

## Controllers: registro e login

```js
// src/controllers/auth.controller.js
const User = require('../models/user.model');
const { hashSenha, compararSenha, gerarToken } = require('../services/auth.service');

async function register(req, res) {
  try {
    const { nome, email, senha } = req.body;

    // validação básica — use express-validator em produção
    if (!nome || !email || !senha) return res.status(400).json({ message: 'Campos obrigatórios' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email já em uso' });

    const senhaHash = await hashSenha(senha);
    const user = await User.create({ nome, email, senha: senhaHash });

    return res.status(201).json({ id: user._id, nome: user.nome, email: user.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao cadastrar usuário' });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ message: 'Campos obrigatórios' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    const ok = await compararSenha(senha, user.senha);
    if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });

    const token = gerarToken({ sub: user._id, email: user.email });
    return res.json({ token, expiresIn: process.env.JWT_EXPIRES_IN });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao realizar login' });
  }
}

module.exports = { register, login };
```

---

## Middleware de proteção (JWT)

```js
// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ message: 'Token não fornecido' });

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Token inválido' });

  const token = parts[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token inválido ou expirado' });
    req.user = decoded; // { sub: userId, email }
    next();
  });
};
```

---

## Rotas (Express)

```js
// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);

module.exports = router;
```

```js
// app.js (trecho)
const express = require('express');
const authRoutes = require('./src/routes/auth.routes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
```

---

## Exemplo de rota protegida

```js
const authMiddleware = require('./src/middlewares/auth.middleware');

app.get('/api/profile', authMiddleware, async (req, res) => {
  // req.user traz as informações do token
  const userId = req.user.sub;
  // busque dados do usuário no banco e retorne
  res.json({ message: 'Acesso autorizado', userId });
});
```

---

## Validação e proteção extras (boas práticas)

* **Valide** inputs com `express-validator` (evita registros com email inválido, senhas fracas, etc.).
* **Limite tentativas de login** (rate limiting) para evitar brute-force. Ex.: `express-rate-limit`.
* **Use HTTPS** em produção (tokens e senhas nunca por HTTP).
* **Não armazene senhas em texto**. Sempre use `bcrypt` com salt e rounds adequados.
* **Use `httpOnly` cookies** para armazenar tokens quando fizer SSR ou clientes web (protege contra XSS).
* **Rotação de chaves** e expiração curta de tokens + refresh tokens se necessário.
* **Sanitize** dados enviados para evitar injeção.
* **Revalide e verifique** token scopes/claims para autorizar ações sensíveis.

---

## Exemplo OpenAPI (trecho) para as rotas de autenticação

```yaml
openapi: 3.0.3
info:
  title: API de Autenticação
  version: 1.0.0
paths:
  /api/auth/register:
    post:
      summary: Registra um novo usuário
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                nome:
                  type: string
                email:
                  type: string
                senha:
                  type: string
              required: [nome, email, senha]
      responses:
        '201':
          description: Usuário criado
  /api/auth/login:
    post:
      summary: Realiza login e retorna JWT
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                senha:
                  type: string
              required: [email, senha]
      responses:
        '200':
          description: Retorna token JWT
```

---

## Testes e inspeção

* Teste endpoints com **Postman** ou **Insomnia**.
* Teste o fluxo:

  1. `POST /api/auth/register` — criar usuário
  2. `POST /api/auth/login` — receber token
  3. `GET /api/profile` com header `Authorization: Bearer <token>` — acessar rota protegida
* Escreva testes automatizados (jest + supertest) cobrindo cenários: cadastro duplicado, login inválido, token expirado, acesso sem token.

---

## Erros comuns e como resolver

* **Senha comparada incorretamente** — lembre de usar `await bcrypt.compare(...)`.
* **Token inválido** — verifique `JWT_SECRET` consistente entre emissão e verificação.
* **CORS** — configure CORS se cliente e API rodarem em origens diferentes.
* **Problemas com env** — confirme variáveis carregadas via `dotenv.config()`.

---

## Checklist de segurança rápida

* [ ] Senha hasheada com salt
* [ ] Token com expiração definida
* [ ] Rate limiting nas rotas de autenticação
* [ ] Validação dos dados de entrada
* [ ] Uso de HTTPS em produção
* [ ] Armazenamento seguro das chaves (vault, variáveis de ambiente)

---

## Referências úteis

* bcryptjs — [https://www.npmjs.com/package/bcryptjs](https://www.npmjs.com/package/bcryptjs)
* jsonwebtoken — [https://www.npmjs.com/package/jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
* OWASP Authentication Cheat Sheet — [https://cheatsheetseries.owasp.org/](https://cheatsheetseries.owasp.org/)
* Implementação de exemplo com Swagger — adapte o README anterior para documentar essas rotas.

---

Se quiser, eu posso:

* Gerar os arquivos de exemplo prontos (controllers, services, middlewares) em um scaffold.
* Criar a especificação OpenAPI completa (YAML) para essas rotas.
* Adicionar exemplos de testes com Jest + Supertest.

Diga o que prefere que eu crie a seguir.
