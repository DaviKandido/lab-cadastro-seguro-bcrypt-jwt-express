import ApiError from "../utils/errorHandler.util.js";

const validateSchema = function (schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues;
      const errors = {};
      for (const issue of issues) {
        const field = issue.path[0];
        const message = issue.message;
        if (!errors[field]) {
          errors[field] = message;
        }
      }

      return next(new ApiError("Validation error: invalid data", 400, errors));
    }
    next();
  };
};

export default validateSchema;
