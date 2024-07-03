class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = "",
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
class ApiResponse {
    constructor(statusCode, message, data) {
        this.statusCode = statusCode,
            this.message = message,
            this.data = data,
            this.success = statusCode < 400
    }
}

export {ApiResponse, ApiError};