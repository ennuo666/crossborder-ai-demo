import { createInMemoryRepositories } from "./in-memory-repository";
import { createPrismaRepositories } from "./prisma-repository";
import type { RepositoryBundle } from "./types";

const globalForRepositories = globalThis as unknown as { crossborderRepositories?: RepositoryBundle };
export function getRepositories(): RepositoryBundle {
  if (process.env.REPOSITORY_MODE !== "memory" && process.env.DATABASE_URL) return createPrismaRepositories();
  if (process.env.NODE_ENV === "production" || process.env.REPOSITORY_MODE !== "memory") throw new Error("PostgreSQL configuration required; memory mode must be explicit outside production");
  globalForRepositories.crossborderRepositories ??= createInMemoryRepositories(false);
  return globalForRepositories.crossborderRepositories;
}
export type { RepositoryBundle } from "./types";

