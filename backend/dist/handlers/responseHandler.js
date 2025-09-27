"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.sendResponse = sendResponse;
exports.errorHandler = errorHandler;
/**
 * AppError - simple error class to carry HTTP status and optional payload
 */
class AppError extends Error {
    constructor(message, status = 500, data = null) {
        var _a;
        super(message);
        this.name = "AppError";
        this.status = status;
        this.data = data;
        (_a = Error.captureStackTrace) === null || _a === void 0 ? void 0 : _a.call(Error, this, AppError);
    }
}
exports.AppError = AppError;
/**
 * sendResponse - helper to send successful responses in the standard shape.
 *
 * Example: sendResponse(res, { items }, "Fetched items", 200)
 */
function sendResponse(res, data = null, message = "Success", statusCode = 200) {
    const payload = {
        bestatus: statusCode >= 200 && statusCode < 300,
        status: statusCode,
        message,
        data,
    };
    return res.status(statusCode).json(payload);
}
/**
 * Express error-handling middleware that returns JSON in the shape:
 * { bestatus: false, message, data }
 */
function errorHandler(err, req, res, next) {
    var _a, _b;
    // Normalize known error shapes
    const status = typeof (err === null || err === void 0 ? void 0 : err.status) === "number"
        ? err.status
        : typeof (err === null || err === void 0 ? void 0 : err.statusCode) === "number"
            ? err.statusCode
            : 500;
    const message = (_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : "Internal Server Error";
    const data = (_b = err === null || err === void 0 ? void 0 : err.data) !== null && _b !== void 0 ? _b : null;
    const payload = {
        bestatus: false,
        status,
        message,
        data,
    };
    res.status(status).json(payload);
}
exports.default = errorHandler;
