import type { CompetitorSnapshot } from "@/lib/types";
import type { MarketplaceProviderResult } from "@/marketplace/types";

export function snapshotCompetitors(result:MarketplaceProviderResult,providerName:string):CompetitorSnapshot[] {
  const failed=new Set(result.enrichmentFailures?.map(item=>item.externalId)??[]);
  const candidateCount=providerName==="serpapi" ? result.products.slice(0,Number(process.env.SERPAPI_ENRICHMENT_LIMIT||5)).length : 0;
  const completeMetadata=result.enrichmentSuccessCount!==undefined && result.enrichmentFailures!==undefined && result.enrichmentSuccessCount+result.enrichmentFailures.length===candidateCount;
  return result.products.map((product,index)=>({...structuredClone(product),enrichmentStatus:failed.has(product.externalId)?"failed":providerName==="mock"?"not_requested":providerName!=="serpapi"?"unknown":index>=candidateCount?"not_requested":completeMetadata?"succeeded":"unknown"}));
}
