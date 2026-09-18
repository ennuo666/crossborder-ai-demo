import type { ResearchAdapter } from "@/adapters/types";
import { mockResearchAdapter } from "@/adapters/mock";
import { getRepositories } from "@/repositories";
import type { RepositoryBundle } from "@/repositories/types";
import { createTask, executeTask } from "./task-service";

export type ResearchResult = { competitorCount: number; coverage: string; priceRange: string; opportunities: string[] };
export function getMockResearch(): ResearchResult { return { competitorCount: 24, coverage: "82%", priceRange: "$28 — $42", opportunities: ["过滤速度快", "一键更换滤芯", "适配冰箱门"] }; }
export async function startResearch(productId: string, adapter: ResearchAdapter = mockResearchAdapter, repositories: RepositoryBundle = getRepositories()) {
  const task = await createTask(productId, "RESEARCH", undefined, repositories);
  const completed = await executeTask(task.id, async () => { const result = await adapter.analyzeCompetitor({ productName: productId }); return result.data ?? getMockResearch(); }, repositories);
  if (completed.status === "succeeded") {
    const data = completed.output as ResearchResult;
    await repositories.research.create({ productId, taskId: task.id, competitorCount: data.competitorCount ?? 24, coverage: data.coverage ?? "82%", priceRange: data.priceRange ?? "$28 — $42", opportunities: data.opportunities ?? getMockResearch().opportunities, source: "mock" });
  }
  return completed;
}
