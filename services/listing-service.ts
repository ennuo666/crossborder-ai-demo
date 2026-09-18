import { getRepositories } from "@/repositories";
import type { ListingCreateInput, RepositoryBundle } from "@/repositories/types";
import { createTask, executeTask } from "./task-service";
import { generateMockListing } from "./content-service";

export async function saveListing(productId: string, input: Omit<ListingCreateInput, "productId">, repositories: RepositoryBundle = getRepositories()) { return repositories.listings.create({ ...input, productId }); }
export async function getLatestListing(productId: string, repositories: RepositoryBundle = getRepositories()) { return repositories.listings.latestByProduct(productId); }
export async function startListingGeneration(productId: string, repositories: RepositoryBundle = getRepositories()) {
  const task = await createTask(productId, "LISTING_GENERATION", undefined, repositories);
  const generated = generateMockListing("PureFlow 便携式净水滤芯水壶");
  const completed = await executeTask(task.id, async () => ({ title: generated, bullets: ["快速过滤", "轻松更换", "冰箱友好", "轻便易携", "安心饮水"], keywords: ["water filter pitcher", "portable purifier", "fast filtration"] }), repositories);
  if (completed.status === "succeeded" && completed.output && typeof completed.output === "object") {
    const output = completed.output as { title: string; bullets: string[]; keywords: string[] };
    await saveListing(productId, { taskId: task.id, title: output.title, bullets: output.bullets, keywords: output.keywords }, repositories);
  }
  return completed;
}
