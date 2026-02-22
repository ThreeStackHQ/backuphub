"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const auth_1 = require("@/auth");
const server_1 = require("next/server");
function middlewareCallback(req) {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const isAuthRoute = nextUrl.pathname.startsWith('/login') ||
        nextUrl.pathname.startsWith('/signup');
    const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/databases') ||
        nextUrl.pathname.startsWith('/backups') ||
        nextUrl.pathname.startsWith('/schema-diff') ||
        nextUrl.pathname.startsWith('/settings');
    // Redirect logged-in users away from auth pages
    if (isLoggedIn && isAuthRoute) {
        return server_1.NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    // Redirect unauthenticated users to login
    if (!isLoggedIn && isDashboardRoute) {
        const loginUrl = new URL('/login', nextUrl);
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
        return server_1.NextResponse.redirect(loginUrl);
    }
    return server_1.NextResponse.next();
}
// auth() returns a NextMiddleware when called with a NextAuthMiddleware callback
exports.default = (0, auth_1.auth)(middlewareCallback);
exports.config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
//# sourceMappingURL=middleware.js.map