import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * Get the authenticated user ID from the current session.
 * Returns null if not authenticated.
 */
export async function getAuthUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/**
 * Helper to return a 401 Unauthorized response
 */
export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

/**
 * Helper to return a 404 Not Found response
 */
export function notFound(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * Helper to return a 403 Forbidden response
 */
export function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
