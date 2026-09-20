import { createInMemoryRepositories } from "./in-memory-repository";
import { createPrismaRepositories } from "./prisma-repository";
import type { RepositoryBundle } from "./types";

const globalForRepositories = globalThis as unknown as { crossborderRepositories?: RepositoryBundle };
export function getRepositories(): RepositoryBundle {
  if (process.env.DATABASE_URL) return createPrismaRepositories();
  globalForRepositories.crossborderRepositories ??= createInMemoryRepositories(true);
  return globalForRepositories.crossborderRepositories;
}
export type { RepositoryBundle } from "./types";

