import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Gunakan /app/data di production agar bisa di-mount persistent volume
// Di development gunakan root project
const dbPath = process.env.NODE_ENV === "production"
  ? "/app/data/dev.db"
  : path.join(process.cwd(), "dev.db");

const adapter = new PrismaBetterSqlite3({ 
  url: `file:${dbPath}` 
});

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
