class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode < 500 ? 'fail' : 'Error'
        this.isOperational = true; 

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;