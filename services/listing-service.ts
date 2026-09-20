import type { ListingAdapter } from "@/adapters/types";
import { getListingAdapter } from "@/adapters/ai";
import { listingGenerationSchema } from "@/ai/schemas";
import { getRepositories } from "@/repositories";
import type { ListingCreateInput, RepositoryBundle } from "@/repositories/types";
import type { ListingResearchContext, ResearchResultRecord } from "@/lib/types";
import { ResourceNotFound } from "./ownership-service";
import { createTask, executeTask } from "./task-service";

export function researchContext(research: ResearchResultRecord): ListingResearchContext {
  return {researchId:research.id,createdAt:research.createdAt,marketplace:research.marketplace,competitorCount:research.competitorCount,priceRange:research.priceRange,userPainPoints:[...research.userPainPoints],recommendedKeywords:[...research.recommendedKeywords]};
}
export async function saveListing(productId:string,input:Omit<ListingCreateInput,"productId"> & {sourceListingId?:string},repositories:RepositoryBundle=getRepositories()) {
  const {sourceListingId,...content}=input;
  if(sourceListingId) {
    const source=(await repositories.listings.listByProduct(productId)).find(row=>row.id===sourceListingId);
    if(!source)throw new ResourceNotFound();
    return repositories.listings.create({...content,productId,researchContext:source.researchContext??null,aiUsage:source.aiUsage??null});
  }
  return repositories.listings.create({...content,productId});
}
export async function getLatestListing(productId:string,repositories:RepositoryBundle=getRepositories()){return repositories.listings.latestByProduct(productId);}
export async function runListingTask(taskId:string,productId:string,repositories:RepositoryBundle=getRepositories(),adapter:ListingAdapter=getListingAdapter()) {
  const research=await repositories.research.latestByProduct(productId);
  const completed=await executeTask(taskId,async()=>{
    if(!research)throw new Error("RESEARCH_REQUIRED");
    const product=await repositories.products.findById(productId);
    if(!product)throw new Error("PRODUCT_NOT_FOUND");
    const result=await adapter.generateListing({productName:product.name,research});
    if(result.state!=="succeeded"||!result.data)throw new Error(result.error?.message??"AI_LISTING_FAILED");
    return {...result,data:listingGenerationSchema.parse(result.data)};
  },repositories);
  if(completed.status==="succeeded"&&research) {
    const result=completed.output as Awaited<ReturnType<ListingAdapter["generateListing"]>>;
    const output=listingGenerationSchema.parse(result.data);
    await saveListing(productId,{taskId,title:output.title,titleZh:output.titleZh,bullets:output.bulletPoints,bulletsZh:output.bulletPointsZh,description:output.description,descriptionZh:output.descriptionZh,keywords:output.keywords,researchContext:researchContext(research),aiUsage:result.usage},repositories);
  }
  return completed;
}
export async function startListingGeneration(productId:string,repositories:RepositoryBundle=getRepositories(),adapter:ListingAdapter=getListingAdapter()){const task=await createTask(productId,"LISTING_GENERATION",undefined,repositories); return runListingTask(task.id,productId,repositories,adapter);}
