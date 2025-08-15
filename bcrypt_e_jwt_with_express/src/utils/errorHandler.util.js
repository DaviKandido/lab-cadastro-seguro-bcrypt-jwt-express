class ApiError extends Error {
    constructor(message, statusCode, errors) {
      super(message);
      this.status = statusCode;
      this.errors = errors;
    }
}

export default ApiError