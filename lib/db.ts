import { PrismaClient } from "../prisma/generated/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaLibSql({
      client: createClient({
        url: `file:${process.cwd()}/prisma/dev.db`,
      }),
    }),
  } as any);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
