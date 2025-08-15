import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import userController from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", authMiddleware, userController.getAll);

export default router;
