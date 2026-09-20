import { getRepositories } from "@/repositories";
import type { RepositoryBundle } from "@/repositories/types";
import type { TaskStatus, TaskType } from "@/lib/types";

export function getDisplayStatus(status: TaskStatus) { return ({ queued: "待开始", running: "需确认", succeeded: "已完成", failed: "失败", cancelled: "已取消" })[status]; }
export async function createTask(productId: string, type: TaskType, input?: unknown, repositories: RepositoryBundle = getRepositories()) { return repositories.tasks.create({ productId, type, input }); }
export async function listTasks(productId: string, repositories: RepositoryBundle = getRepositories()) { return repositories.tasks.listByProduct(productId); }
export async function executeTask<T>(taskId: string, handler: () => Promise<T>, repositories: RepositoryBundle = getRepositories()) {
  const existing = await repositories.tasks.findById(taskId);
  if (!existing) throw new Error("TASK_NOT_FOUND");
  if (existing.status !== "queued") return existing as typeof existing & { output?: T };
  await repositories.tasks.update(taskId, { status: "running", progress: 10, startedAt: new Date().toISOString() });
  try {
    const output = await handler();
    return repositories.tasks.update(taskId, { status: "succeeded", progress: 100, output, finishedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "任务执行失败";
    const errorCode = /^[A-Z][A-Z0-9_]+$/.test(message) ? message : "TASK_FAILED";
    return repositories.tasks.update(taskId, { status: "failed", progress: 100, errorCode, errorMessage: message, finishedAt: new Date().toISOString() });
  }
}
