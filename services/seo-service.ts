import { mockSeoAdapter } from "@/adapters/mock";
import { getRepositories } from "@/repositories";
import type { RepositoryBundle } from "@/repositories/types";
import { createTask, executeTask } from "./task-service";

export function runMockSeoAudit() { return { score: 82, issues: 4, status: "succeeded" as const }; }
export async function startSeoAudit(productId: string, repositories: RepositoryBundle = getRepositories()) {
  const task = await createTask(productId, "SEO_AUDIT", undefined, repositories);
  const completed = await executeTask(task.id, async () => (await mockSeoAdapter.runSeoAudit({ productName: productId })).data ?? runMockSeoAudit(), repositories);
  if (completed.status === "succeeded") await repositories.seoAudits.create({ productId, taskId: task.id, score: 82, issueCount: 4, details: { highPriority: 1 }, status: "completed" });
  return completed;
}
