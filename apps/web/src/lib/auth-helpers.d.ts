import { NextResponse } from 'next/server';
/**
 * Get the authenticated user ID from the current session.
 * Returns null if not authenticated.
 */
export declare function getAuthUserId(): Promise<string | null>;
/**
 * Helper to return a 401 Unauthorized response
 */
export declare function unauthorized(): NextResponse<{
    error: string;
}>;
/**
 * Helper to return a 404 Not Found response
 */
export declare function notFound(message?: string): NextResponse<{
    error: string;
}>;
/**
 * Helper to return a 403 Forbidden response
 */
export declare function forbidden(): NextResponse<{
    error: string;
}>;
//# sourceMappingURL=auth-helpers.d.ts.map