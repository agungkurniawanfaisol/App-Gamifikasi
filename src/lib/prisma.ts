import { PrismaClient } from "@prisma/client";

// Singleton Prisma client for Next.js.
//
// In development, Next.js hot reload re-evaluates modules on every change.
// Without a singleton, each reload creates a new PrismaClient instance,
// exhausting the MySQL connection pool ("too many connections" error).
//
// We attach the client to globalThis so it survives across hot reloads.
// In production, a single instance is created and reused for the process lifetime.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
