import userRepository from "../repositories/user.repository.js";
import ApiError from "../utils/errorHandler.util.js";

// Controllers
const getAll = async (req, res, next) => {
    try {
        const users = await userRepository.findAllUsers();

        if (!users) {
            return next(
                new ApiError("Users not found", 404, {
                    users: "Users not found",
                })
            );
        }

        res.status(200).json(users);
    } catch (error) {
        next(new ApiError("Error getting users", 500, error.message));
    }
};

export default {
  getAll,
};
