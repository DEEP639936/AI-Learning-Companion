// Database client — optional dependency
// ─────────────────────────────────────────────────────────────────────────────
// On Vercel/serverless: Prisma with SQLite won't work.
// This file gracefully handles the case where Prisma/DB is not available.
// The app still works — flashcard review just returns a friendly error.
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient | null = null;

try {
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
} catch (error) {
  console.warn('[DB] Prisma client could not be initialized. Database features will be disabled.', error);
  prismaInstance = null;
}

export const db = prismaInstance;

/**
 * Check if the database is available.
 * Use this before making DB calls to provide graceful fallbacks.
 */
export function isDatabaseAvailable(): boolean {
  return db !== null;
}
