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
