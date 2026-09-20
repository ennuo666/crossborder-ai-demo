export function validateProductionConfig(env: NodeJS.ProcessEnv = process.env) {
  if (env.NODE_ENV !== "production") return;
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  if (env.REPOSITORY_MODE === "memory") throw new Error("Production requires PostgreSQL");
  if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters");
  if (!env.BETTER_AUTH_URL) throw new Error("BETTER_AUTH_URL is required");
  if (!["mock", "openai-compatible"].includes(env.AI_PROVIDER ?? "")) throw new Error("Explicit AI_PROVIDER is required");
  if (env.AI_PROVIDER !== "mock" && !(env.AI_API_KEY || env.OPENAI_API_KEY)) throw new Error("AI_API_KEY is required");
  if (!["mock", "serpapi", "amazon-api"].includes(env.MARKETPLACE_PROVIDER ?? "")) throw new Error("Explicit MARKETPLACE_PROVIDER is required");
  if (env.MARKETPLACE_PROVIDER === "serpapi" && !env.SERPAPI_API_KEY) throw new Error("SERPAPI_API_KEY is required");
  if (env.MARKETPLACE_PROVIDER === "amazon-api" && !env.AMAZON_RESEARCH_API_KEY) throw new Error("AMAZON_RESEARCH_API_KEY is required");
}
