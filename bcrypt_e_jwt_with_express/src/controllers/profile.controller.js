import ApiError from "../utils/errorHandler.util.js";

// Controllers
const getProfile = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
          return next(
            new ApiError("Users not found", 404, {
              user: "Users not found",
            })
          );
        }

        res.status(200).json(user);
    } catch (error) {
        next(new ApiError("Error getting Profile user", 500, error.message));
    }
};

export default {
  getProfile,
};
