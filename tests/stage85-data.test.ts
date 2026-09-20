import test from "node:test";
import assert from "node:assert/strict";
import { createInMemoryRepositories } from "@/repositories/in-memory-repository";
import { startResearch } from "@/services/research-service";
import { startListingGeneration, saveListing } from "@/services/listing-service";
import { forUser } from "@/services/ownership-service";
import { listingGenerationSchema } from "@/ai/schemas";
import { listingSaveSchema } from "@/ai/schemas";
import { snapshotCompetitors } from "@/services/competitor-snapshot";
import { mockMarketplaceProvider } from "@/marketplace/providers/mock-marketplace-provider";
import { mockListingOutput } from "@/ai/mock-listing";

test("new generation requires paired bilingual five bullets", () => {
  assert.equal(listingGenerationSchema.safeParse({title:"Filter",bulletPoints:["Easy"],description:"Filter",keywords:["filter"]}).success,false);
  assert.equal(listingGenerationSchema.safeParse(mockListingOutput).success,true);
  assert.equal(listingGenerationSchema.safeParse({...mockListingOutput,bulletPointsZh:["单条"]}).success,false);
  assert.equal(listingGenerationSchema.safeParse({...mockListingOutput,title:"中文标题"}).success,false);
  assert.equal(listingSaveSchema.safeParse({title:"Legacy",bullets:["One"],keywords:[]}).success,true);
  assert.equal(listingSaveSchema.safeParse({title:"Edit",bullets:["One"],bulletsZh:["一","二"]}).success,false);
});
test("snapshot enrichment status reflects evidence and configured candidate count", async () => {
  const previous=process.env.SERPAPI_ENRICHMENT_LIMIT;
  process.env.SERPAPI_ENRICHMENT_LIMIT="2";
  try {
    const result=await mockMarketplaceProvider.search({query:"filter",limit:3});
    const failedId=result.products[1].externalId;
    const enriched={...result,enrichmentSuccessCount:1,enrichmentFailures:[{externalId:failedId,code:"TIMEOUT",message:"Timed out"}]};
    assert.deepEqual(snapshotCompetitors(enriched,"serpapi").map(row=>row.enrichmentStatus),result.products.map((_,i)=>i===0?"succeeded":i===1?"failed":"not_requested"));
    assert.equal(snapshotCompetitors({...result,enrichmentSuccessCount:undefined,enrichmentFailures:undefined},"serpapi")[0].enrichmentStatus,"unknown");
    assert.ok(snapshotCompetitors(result,"mock").every(row=>row.enrichmentStatus==="not_requested"));
  } finally {if(previous===undefined)delete process.env.SERPAPI_ENRICHMENT_LIMIT;else process.env.SERPAPI_ENRICHMENT_LIMIT=previous;}
});
test("research snapshots and generated listing provenance survive version edits", async () => {
  const repos=createInMemoryRepositories();
  const product=await repos.products.create({name:"Travel Filter",market:"US",channel:"Amazon",userId:"a"});
  await startResearch(product.id,undefined,repos);
  const research=await repos.research.latestByProduct(product.id);
  assert.ok(research?.competitorSnapshot?.length);
  let receivedName="";
  const task=await startListingGeneration(product.id,repos,{async generateListing(input){receivedName=input.productName;return {state:"succeeded",source:"mock",data:mockListingOutput,usage:{provider:"mock",latencyMs:1}};}});
  assert.equal(task.status,"succeeded");
  assert.equal(receivedName,product.name);
  const first=await repos.listings.latestByProduct(product.id);
  assert.ok(first?.titleZh);
  assert.equal(first.bullets.length,5);
  assert.equal(first.bulletsZh?.length,5);
  assert.equal(first.researchContext?.researchId,research.id);
  const next=await saveListing(product.id,{title:first.title,bullets:first.bullets,keywords:first.keywords,sourceListingId:first.id},repos);
  assert.deepEqual(next.researchContext,first.researchContext);
  assert.deepEqual(next.aiUsage,first.aiUsage);
  assert.deepEqual((await forUser("a",repos).detail(product.id)).listings.map(x=>x.version),[2,1]);
  const other=await repos.products.create({name:"Other",market:"US",channel:"Amazon",userId:"b"});
  await assert.rejects(saveListing(other.id,{title:"Foreign",bullets:[],keywords:[],sourceListingId:first.id},repos),/Resource not found/);
  await assert.rejects(saveListing(product.id,{title:"Missing",bullets:[],keywords:[],sourceListingId:"missing"},repos),/Resource not found/);
});
