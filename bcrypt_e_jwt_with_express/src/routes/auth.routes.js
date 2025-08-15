import express from "express";
import authController from "../controllers/auth.controller.js";
import { signUpSchema, loginSchema } from "../utils/zodSchemas.util.js";
import validateSchema from "../middlewares/validateSchemas.middleware.js";

const router = express.Router();

router.post("/register", validateSchema(signUpSchema), authController.signUp);
router.post("/login", validateSchema(loginSchema), authController.login);

export default router;