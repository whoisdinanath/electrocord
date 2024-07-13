class ApiError extends Error {
    constructor(statusCode, message, details = []) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.details = details;
    }

    toJSON() {
        if (this.details.length === 0) {
            return {
                success: this.success,
                statusCode: this.statusCode,
                message: this.message,
            };
        }
        else {
            return {
                success: this.success,
                statusCode: this.statusCode,
                message: this.message,
                details: this.details,
            };
        }
    }
}
class ApiResponse {
    constructor(statusCode, message, data = null) { // Assuming data might not always be present
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400; // Automatically determine success based on statusCode
    }
}

export { ApiResponse, ApiError };