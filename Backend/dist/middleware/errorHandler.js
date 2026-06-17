"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            status: 'error',
        });
    }
    console.error('Unexpected error:', err);
    res.status(500).json({
        error: 'Internal server error',
        status: 'error',
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map