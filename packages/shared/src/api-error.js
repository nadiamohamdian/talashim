"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseApiErrorMessage = parseApiErrorMessage;
function parseApiErrorMessage(data, fallback = 'خطایی رخ داد') {
    if (typeof data !== 'object' || data === null || !('message' in data)) {
        return fallback;
    }
    const payload = data.message;
    if (typeof payload === 'string') {
        return payload;
    }
    if (Array.isArray(payload) && typeof payload[0] === 'string') {
        return payload[0];
    }
    return fallback;
}
//# sourceMappingURL=api-error.js.map