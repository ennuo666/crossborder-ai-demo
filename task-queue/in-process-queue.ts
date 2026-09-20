import type { TaskQueue } from "./types";
import { runTask } from "@/task-worker/runner";
import { getRepositories } from "@/repositories";
import { recoverPersistedTasks } from "@/task-recovery/service";
const state = globalThis as unknown as { pendingTasks?: Set<string>; workerStarted?: boolean };
const pending = state.pendingTasks ??= new Set<string>();
export class InProcessTaskQueue implements TaskQueue {
  async enqueue(taskId: string) {
    if (pending.has(taskId)) return;
    pending.add(taskId);
    setTimeout(() => {
      void runTask(taskId).catch(() => console.error(JSON.stringify({ event: "worker_error", taskId, errorCode: "WORKER_FAILED" }))).finally(() => pending.delete(taskId));
    }, 0);
  }
}
export const taskQueue: TaskQueue = new InProcessTaskQueue();
export async function bootstrapWorker() {
  if (state.workerStarted) return;
  const summary = await recoverPersistedTasks(getRepositories(), taskQueue);
  state.workerStarted = true;
  console.info(JSON.stringify({ event: "task_recovery", ...summary }));
}
