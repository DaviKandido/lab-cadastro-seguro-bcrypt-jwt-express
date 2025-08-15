import jwt from "jsonwebtoken";
import ApiError from "../utils/errorHandler.util.js";

function authMiddleware(req, res, next) {
  try {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(" ")[1];

    if (!token) {
      return next(
        new ApiError("Token not found", 401, { token: "Token not found" })
      );
    }

    jwt.verify(token, process.env.JWT_SECRET || "secret", (error, user) => {
        if(error){
            return next(new ApiError("Error authenticating user", 401, error.message));
        }
        req.user = user;
        next();
    })
  } catch (error) {
    return next(new ApiError("Error authenticating user", 401, error.message));
  }
}

export default authMiddleware;
