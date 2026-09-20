import test from "node:test";
import assert from "node:assert/strict";
import { createInMemoryRepositories } from "@/repositories/in-memory-repository";
import { forUser, ResourceNotFound } from "@/services/ownership-service";
import { validateProductionConfig } from "@/lib/runtime-config";
import { runTask } from "@/task-worker/runner";

test("ownership isolates all product resources and worker output", async context => {
  const originalAi = process.env.AI_PROVIDER, originalMarketplace = process.env.MARKETPLACE_PROVIDER;
  process.env.AI_PROVIDER = "mock"; process.env.MARKETPLACE_PROVIDER = "mock";
  context.after(() => {
    if (originalAi === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = originalAi;
    if (originalMarketplace === undefined) delete process.env.MARKETPLACE_PROVIDER; else process.env.MARKETPLACE_PROVIDER = originalMarketplace;
  });
  const repositories = createInMemoryRepositories();
  const a = forUser("user-a", repositories), b = forUser("user-b", repositories);
  assert.deepEqual(await a.list(), []);
  const product = await repositories.products.create({ userId: "user-a", name: "wireless charger", market: "US", channel: "Amazon" });
  const other = await repositories.products.create({ userId: "user-b", name: "private", market: "US", channel: "Amazon" });
  await repositories.products.create({ name: "legacy", market: "US", channel: "Amazon" });
  assert.equal((await a.list()).length, 1);
  assert.equal((await a.product(product.id)).userId, "user-a");
  await assert.rejects(a.product(other.id), ResourceNotFound);
  await assert.rejects(b.detail(product.id), ResourceNotFound);
  const task = await repositories.tasks.create({ productId: product.id, type: "RESEARCH" });
  assert.equal((await runTask(task.id, repositories))?.status, "succeeded");
  const listing = await repositories.tasks.create({ productId: product.id, type: "LISTING_GENERATION" });
  assert.equal((await runTask(listing.id, repositories))?.status, "succeeded");
  await repositories.assets.create({ productId: product.id, taskId: null, kind: "image", name: "private", url: null, metadata: {}, status: "ready" });
  await repositories.seoAudits.create({ productId: product.id, taskId: null, score: 1, issueCount: 1, details: {}, status: "completed" });
  const detail = await a.detail(product.id);
  assert.equal(detail.research?.productId, product.id);
  assert.equal(detail.listing?.productId, product.id);
  assert.equal(detail.assets.length, 1);
  assert.ok(detail.seoAudit);
  await assert.rejects(b.task(task.id), ResourceNotFound);
  await assert.rejects(b.task(listing.id), ResourceNotFound);
  await assert.rejects(b.detail(product.id), ResourceNotFound);
  await assert.rejects(b.detail("nonexistent"), ResourceNotFound);
});

test("production configuration fails closed", () => {
  const valid: NodeJS.ProcessEnv = { NODE_ENV: "production", DATABASE_URL: "postgresql://test", BETTER_AUTH_SECRET: "x".repeat(32), BETTER_AUTH_URL: "https://example.test", AI_PROVIDER: "mock", MARKETPLACE_PROVIDER: "mock" };
  assert.doesNotThrow(() => validateProductionConfig(valid));
  for (const key of ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "AI_PROVIDER", "MARKETPLACE_PROVIDER"]) {
    const env = { ...valid }; delete env[key]; assert.throws(() => validateProductionConfig(env));
  }
  assert.throws(() => validateProductionConfig({ ...valid, REPOSITORY_MODE: "memory" }));
  assert.throws(() => validateProductionConfig({ ...valid, AI_PROVIDER: "openai-compatible" }));
  assert.throws(() => validateProductionConfig({ ...valid, MARKETPLACE_PROVIDER: "serpapi" }));
});
