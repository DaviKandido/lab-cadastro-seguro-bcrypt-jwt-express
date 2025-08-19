import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import profileController from "../controllers/profile.controller.js";

const router = express.Router();

/**
 * @fileoverview Rotas de perfil
 * @module api/profile
 * @author Davi Cândido
 * @github https://github.com/daviKandido
 * @license MIT
 * @version 1.0.1
 * @since 1.0.1
 * @exports module:api/profile
 * 
 */

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


export default router;
