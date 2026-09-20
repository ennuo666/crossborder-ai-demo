import { getRepositories } from "@/repositories";
import { runResearchTask } from "@/services/research-service";
import { runListingTask } from "@/services/listing-service";
import type { RepositoryBundle } from "@/repositories/types";

export async function runTask(taskId: string, repositories: RepositoryBundle = getRepositories()) {
  const task = await repositories.tasks.findById(taskId);
  if (!task || task.status !== "queued") return task;
  const product = await repositories.products.findById(task.productId);
  if (!product || (process.env.NODE_ENV === "production" && !product.userId)) {
    return repositories.tasks.update(task.id, { status: "failed", errorCode: "OWNER_REQUIRED", errorMessage: "Task has no active owner", finishedAt: new Date().toISOString() });
  }
  const started = Date.now();
  const result = task.type === "RESEARCH" ? await runResearchTask(task.id, product.id, undefined, repositories)
    : task.type === "LISTING_GENERATION" ? await runListingTask(task.id, product.id, repositories)
    : await repositories.tasks.update(task.id, { status: "failed", progress: 100, errorCode: "UNSUPPORTED_TASK_TYPE", errorMessage: "该任务类型暂未支持", finishedAt: new Date().toISOString() });
  console.info(JSON.stringify({ event: "task_finished", taskId, taskType: task.type, userId: product.userId, latency: Date.now() - started, status: result.status, errorCode: result.errorCode }));
  return result;
}
