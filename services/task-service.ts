import { getRepositories } from "@/repositories";
import type { RepositoryBundle } from "@/repositories/types";
import type { TaskStatus, TaskType } from "@/lib/types";

export function getDisplayStatus(status: TaskStatus) { return ({ queued: "待开始", running: "需确认", succeeded: "已完成", failed: "失败", cancelled: "已取消" })[status]; }
export async function createTask(productId: string, type: TaskType, input?: unknown, repositories: RepositoryBundle = getRepositories()) { return repositories.tasks.create({ productId, type, input }); }
export async function listTasks(productId: string, repositories: RepositoryBundle = getRepositories()) { return repositories.tasks.listByProduct(productId); }
export async function executeTask<T>(taskId: string, handler: () => Promise<T>, repositories: RepositoryBundle = getRepositories()) {
  await repositories.tasks.update(taskId, { status: "running", progress: 10 });
  try {
    const output = await handler();
    return repositories.tasks.update(taskId, { status: "succeeded", progress: 100, output });
  } catch (error) {
    const message = error instanceof Error ? error.message : "任务执行失败";
    return repositories.tasks.update(taskId, { status: "failed", progress: 100, errorCode: "TASK_FAILED", errorMessage: message });
  }
}
