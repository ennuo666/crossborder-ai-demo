import type { ResearchAdapter } from "@/adapters/types";
import { getResearchAdapter } from "@/adapters/ai";
import { getRepositories } from "@/repositories";
import type { RepositoryBundle } from "@/repositories/types";
import type { ResearchAnalysis } from "@/ai/schemas";
import { createTask, executeTask } from "./task-service";
export type ResearchResult = ResearchAnalysis;
export function getMockResearch(): ResearchResult { return { coreSellingPoints:["过滤速度快"], userPainPoints:["更换复杂"], targetUsers:["家庭用户"], competitorDifferentiators:["便携"], recommendedKeywords:["water filter"], risks:["价格需复核"], competitorCount:24, coverage:"82%", priceRange:"$28 — $42", opportunities:["过滤速度快"] }; }
export async function startResearch(productId: string, adapter: ResearchAdapter = getResearchAdapter(), repositories: RepositoryBundle = getRepositories()) { const task=await createTask(productId,"RESEARCH",undefined,repositories); const completed=await executeTask(task.id,async()=>{const result=await adapter.analyzeCompetitor({productName:productId}); if(result.state!=="succeeded"||!result.data) throw new Error(result.error?.message??"AI_RESEARCH_FAILED"); return result.data;},repositories); if(completed.status==="succeeded"){const data=completed.output as ResearchResult; await repositories.research.create({productId,taskId:task.id,...data,source: process.env.AI_PROVIDER === "mock" || !process.env.AI_API_KEY ? "mock" : "external"});} return completed; }


