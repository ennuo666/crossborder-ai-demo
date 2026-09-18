import type { ResearchAdapter } from "@/adapters/types";
import { getResearchAdapter } from "@/adapters/ai";
import { getMarketplaceProvider } from "@/marketplace/provider";
import { calculateCompetitorStats } from "@/marketplace/stats";
import { getRepositories } from "@/repositories";
import type { RepositoryBundle } from "@/repositories/types";
import type { ResearchAnalysis } from "@/ai/schemas";
import { createTask, executeTask } from "./task-service";
export type ResearchResult = ResearchAnalysis & { marketplace:string; query:string; competitorIds:string[]; fetchedAt:string; stats:Record<string,unknown> };
export async function startResearch(productId:string, adapter:ResearchAdapter=getResearchAdapter(), repositories:RepositoryBundle=getRepositories()){const task=await createTask(productId,"RESEARCH",undefined,repositories); const completed=await executeTask(task.id,async()=>{const marketplace=await getMarketplaceProvider().search({query:productId,marketplace:process.env.AMAZON_MARKETPLACE||"amazon",limit:10}); const stats=calculateCompetitorStats(marketplace.products); const result=await adapter.analyzeCompetitor({productName:productId,competitors:marketplace.products,stats}); if(result.state!=="succeeded"||!result.data)throw new Error(result.error?.message??"AI_RESEARCH_FAILED"); return {...result.data,competitorCount:stats.competitorCount,priceRange:stats.priceRange,marketplace:marketplace.marketplace,query:marketplace.query,competitorIds:marketplace.products.map(p=>p.externalId),fetchedAt:marketplace.fetchedAt,stats};},repositories); if(completed.status==="succeeded"){const data=completed.output as ResearchResult; await repositories.research.create({productId,taskId:task.id,...data,source:process.env.MARKETPLACE_PROVIDER==="amazon-api"?"amazon-api":"mock"});} return completed;}
