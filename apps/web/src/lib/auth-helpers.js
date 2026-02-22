"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthUserId = getAuthUserId;
exports.unauthorized = unauthorized;
exports.notFound = notFound;
exports.forbidden = forbidden;
const auth_1 = require("@/auth");
const server_1 = require("next/server");
/**
 * Get the authenticated user ID from the current session.
 * Returns null if not authenticated.
 */
async function getAuthUserId() {
    const session = await (0, auth_1.auth)();
    return session?.user?.id ?? null;
}
/**
 * Helper to return a 401 Unauthorized response
 */
function unauthorized() {
    return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
/**
 * Helper to return a 404 Not Found response
 */
function notFound(message = 'Not found') {
    return server_1.NextResponse.json({ error: message }, { status: 404 });
}
/**
 * Helper to return a 403 Forbidden response
 */
function forbidden() {
    return server_1.NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
//# sourceMappingURL=auth-helpers.js.map