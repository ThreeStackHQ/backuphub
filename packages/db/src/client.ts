import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const queryClient = postgres(url);
  return drizzle(queryClient, { schema });
}

// Lazy singleton — only connects when first used (build-safe)
let _db: ReturnType<typeof getDb> | null = null;

export function getDatabase() {
  if (!_db) _db = getDb();
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    return getDatabase()[prop as keyof ReturnType<typeof getDb>];
  },
});
