import assert from "node:assert/strict";
import test from "node:test";
import { createProduct } from "../services/product-service";
import { executeTask } from "../services/task-service";
import { getLatestListing, saveListing } from "../services/listing-service";
import { createInMemoryRepositories } from "../repositories/in-memory-repository";

test("creating a product persists it and queues a task", async () => {
  const repositories = createInMemoryRepositories();
  const result = await createProduct({ name: "测试水壶", market: "美国", channel: "Amazon US" }, repositories);

  assert.equal(result.product.name, "测试水壶");
  assert.equal(result.task?.status, "queued");
  assert.equal((await repositories.products.list()).length, 1);
});

test("executing a task records running and succeeded state", async () => {
  const repositories = createInMemoryRepositories();
  const { product, task } = await createProduct({ name: "任务水壶", market: "美国", channel: "Amazon US" }, repositories);
  assert.ok(task);

  const completed = await executeTask(task.id, async () => ({ productId: product.id, score: 82 }), repositories);

  assert.equal(completed.status, "succeeded");
  assert.equal(completed.progress, 100);
  assert.deepEqual(completed.output, { productId: product.id, score: 82 });
});

test("listing versions can be saved and the latest version can be reloaded", async () => {
  const repositories = createInMemoryRepositories();
  const { product } = await createProduct({ name: "Listing 水壶", market: "美国", channel: "Amazon US" }, repositories);

  await saveListing(product.id, { title: "版本 1", bullets: ["快"], keywords: ["pitcher"] }, repositories);
  const latest = await saveListing(product.id, { title: "版本 2", bullets: ["更快"], keywords: ["water filter pitcher"] }, repositories);
  const loaded = await getLatestListing(product.id, repositories);

  assert.equal(latest.version, 2);
  assert.equal(loaded?.title, "版本 2");
});
