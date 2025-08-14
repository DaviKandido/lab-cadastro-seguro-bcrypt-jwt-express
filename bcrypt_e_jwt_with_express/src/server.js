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

import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";


const PORT = process.env.PORT || 3000;


// Catch-all para rotas não encontradas → envia para o middleware de erro
app.use((req, res, next) => {
  const error = new ApiError("Page not found!", 404, [
    {
      path: req.url,
      message: "Page not found!",
    },
  ]);
  next(error); // passa para o middleware de erro
});


// Middleware de erro que trata 404 e demais erros
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: err.statusCode || 500,
    message: err.message || "Something went wrong!",
    errors: err.errors || null,
  });
});

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
