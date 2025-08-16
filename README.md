# 🚀 Guia de Desenvolvimento — Rotas de Cadastro Seguro (bcrypt + JWT)

📘 Este guia explica passo a passo como **implementar rotas seguras de cadastro e autenticação** em um projeto **Node.js + Express** usando **bcrypt** 🔐 para hashing de senhas e **JSON Web Tokens (JWT)** 🪪 para autenticação baseada em token.
Ele também traz dicas de segurança ⚠️, exemplos de middlewares ⚙️ e um exemplo de documentação **OpenAPI/Swagger** 📑.

---

## 🔎 Introdução – Por que segurança no back-end é importante?

🔒 Dados de usuários (como senhas, e-mails e informações pessoais) são alvo de ataques constantes.
Sem proteção, qualquer invasor que tenha acesso ao banco de dados pode visualizar todas as senhas em texto puro.

✅ Boas práticas de segurança como **hash de senhas** e **autenticação baseada em tokens** são essenciais para proteger dados e evitar acessos não autorizados.

---

# 🧩 O que é o bcrypt e como será utilizado?

O **bcrypt** é uma biblioteca para gerar **hashes seguros de senhas**, tornando-as ilegíveis no banco de dados.
Mas antes, é importante entender o conceito de **hash**: um processo unidirecional 🔁 que transforma uma senha em uma sequência única e irreversível.

✨ O bcrypt aplica o **salt** 🧂, que adiciona aleatoriedade ao hash, dificultando ataques como **rainbow tables**.

Utilizaremos:

```js
 bcrypt.hash()     ➝ Criar o hash antes de salvar no banco
 bcrypt.genSalt()  ➝ Gerar um hash mais seguro
 bcrypt.compare()  ➝ Verificar se a senha informada corresponde ao hash armazenado
```

📖 Veja a explicação e implementação passo a passo do bcrypt em:

- [🔗 Implementação passo a passo do bcrypt](/bcrypt_na_pratica)

---

# 🪪 O que é JWT e como será utilizado?

O **JWT (JSON Web Token)** é um padrão para **autenticação e troca segura de informações** entre cliente e servidor 🤝.

Ele é composto por três partes:

- 🏷️ **Header** — tipo do token e algoritmo usado
- 📦 **Payload** — informações do usuário (id, e-mail, etc.)
- ✍️ **Signature** — garante que o token não foi alterado

⚡ Após o login, o servidor gera um **token JWT** que será enviado pelo cliente em cada requisição, permitindo acesso a rotas protegidas sem precisar reenviar login e senha a cada vez.

Utilizaremos:

```js
 jwt.sign()    ➝ Gerar o token
 jwt.verify()  ➝ Validar o token recebido do cliente
 jwt.decode()  ➝ Retornar o payload
```

📖 Veja a explicação e implementação passo a passo do JWT em:

- [🔗 Implementação passo a passo do JWT](/jwt_na_pratica)

---

# 🛠️ Projeto Prático

## 🎯 Objetivo

Criar rotas REST seguras para:

- 👤 **Cadastro de usuário** — `POST /api/auth/register` ➝ salvar usuário com senha hasheada
- 🔑 **Login / Autenticação** — `POST /api/auth/login` ➝ verificar credenciais e emitir JWT
- 🔐 **Rota protegida de exemplo** — `GET /api/profile` ➝ exige token válido

📖 Veja a implementação completa em:

- [🔗 Implementação do projeto](/bcrypt_e_jwt_with_express)

---

## 📚 Referências úteis

- 🔐 bcryptjs — [https://www.npmjs.com/package/bcryptjs](https://www.npmjs.com/package/bcryptjs)
- 🪪 jsonwebtoken — [https://www.npmjs.com/package/jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- 🛡️ OWASP Authentication Cheat Sheet — [https://cheatsheetseries.owasp.org/](https://cheatsheetseries.owasp.org/)
- 📑 Exemplo com Swagger — [https://github.com/webtech-network/lab-documentacao-swagger-express.git](https://github.com/webtech-network/lab-documentacao-swagger-express.git)

---

# Contato

📧 **Email:** [davicandidopucminas@gmail.com](mailto:davicandidopucminas@gmail.com)
💼 **LinkedIn:** [www.linkedin.com/in/davi-candido-de-almeida](www.linkedin.com/in/davi-candido-de-almeida)
🐙 **GitHub:** [github.com/DaviKandido](https://github.com/DaviKandido)
