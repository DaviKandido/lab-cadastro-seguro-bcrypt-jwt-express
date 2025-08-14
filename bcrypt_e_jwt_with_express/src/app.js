/**
 * @fileoverview API de autenticação segura em Node.js + Express.
 * Implementa rotas para cadastro, login e acesso a rotas protegidas.
 * Utiliza bcryptjs para hashing de senhas e JWT (JSON Web Token) para autenticação baseada em token.
 * Inclui boas práticas de segurança, middleware de verificação de token e estrutura organizada em controllers, services e middlewares.
 *
 * Rotas principais:
 *  - POST /api/auth/register → Cadastra novo usuário com senha hasheada
 *  - POST /api/auth/login    → Autentica usuário e retorna token JWT
 *  - GET  /api/profile       → Rota protegida, exige token válido
 *
 * @author Davi Cândido
 * @github https://github.com/daviKandido
 */


import express from "express";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(
    `${new Date().toLocaleString()} | Requisição: ${req.method} ${req.url}`
  );
  next();
});


export default app;
