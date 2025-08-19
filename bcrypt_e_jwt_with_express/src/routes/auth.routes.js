import express from "express";
import authController from "../controllers/auth.controller.js";
import { signUpSchema, loginSchema } from "../utils/zodSchemas.util.js";
import validateSchema from "../middlewares/validateSchemas.middleware.js";

const router = express.Router();

/**
 * @fileoverview Rotas de autenticação
 * @module api/auth
 * @author Davi Cândido
 * @github https://github.com/daviKandido
 * @license MIT
 * @version 1.0.0
 * @since 1.0.0
 * @exports module:api/auth
 * 
 */

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


export default router;