import { mockAssetAdapter } from "@/adapters/mock";
import { getRepositories } from "@/repositories";
import type { RepositoryBundle } from "@/repositories/types";
import { createTask, executeTask } from "./task-service";

export async function generateMockAssets() { return { count: 4, status: "succeeded" as const }; }
export async function startAssetGeneration(productId: string, repositories: RepositoryBundle = getRepositories()) {
  const task = await createTask(productId, "ASSET_GENERATION", undefined, repositories);
  const completed = await executeTask(task.id, async () => (await mockAssetAdapter.generateProductImages({ productName: productId })).data ?? generateMockAssets(), repositories);
  if (completed.status === "succeeded") await repositories.assets.create({ productId, taskId: task.id, kind: "product-image", name: "商品素材批次", url: null, metadata: { count: 4 }, status: "ready" });
  return completed;
}
