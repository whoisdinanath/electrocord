class ApiError extends Error {
    constructor(statusCode, message, details = []) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.details = details; // Add this line
    }

    toJSON() {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            details: this.details, // Include details in the JSON response
        };
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