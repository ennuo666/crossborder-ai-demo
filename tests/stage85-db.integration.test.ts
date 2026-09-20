import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { createPrismaRepositories } from "@/repositories/prisma-repository";
import { mockMarketplaceProvider } from "@/marketplace/providers/mock-marketplace-provider";
import { mockListingOutput } from "@/ai/mock-listing";
import { researchContext, saveListing } from "@/services/listing-service";

test("PostgreSQL reload retains bilingual versions and frozen research evidence", {skip:!(process.env.DATABASE_URL&&process.env.RUN_DB_INTEGRATION==="1")}, async()=>{
  const client=new PrismaClient();
  const reload=new PrismaClient();
  let productId:string|undefined;
  try {
    const repos=createPrismaRepositories(client);
    const product=await repos.products.create({name:`stage85-db-${Date.now()}`,market:"US",channel:"Amazon"});
    productId=product.id;
    const market=await mockMarketplaceProvider.search({query:product.name});
    const research=await repos.research.create({productId,taskId:null,competitorCount:market.products.length,coverage:"",priceRange:"$10-$30",opportunities:[],coreSellingPoints:[],userPainPoints:["Choosing suitable size"],targetUsers:[],competitorDifferentiators:[],recommendedKeywords:["travel"],risks:[],source:"mock",marketplace:market.marketplace,query:market.query,competitorIds:market.products.map(p=>p.externalId),competitorSnapshot:market.products.map(p=>({...p,enrichmentStatus:"not_requested" as const})),fetchedAt:market.fetchedAt,stats:{}});
    const output=mockListingOutput;
    const first=await repos.listings.create({productId,title:output.title,titleZh:output.titleZh,bullets:output.bulletPoints,bulletsZh:output.bulletPointsZh,description:output.description,descriptionZh:output.descriptionZh,keywords:output.keywords,researchContext:researchContext(research),aiUsage:{provider:"mock",latencyMs:2}});
    await saveListing(productId,{title:"Edited product",titleZh:first.titleZh,bullets:first.bullets,bulletsZh:first.bulletsZh,description:first.description,descriptionZh:first.descriptionZh,keywords:first.keywords,sourceListingId:first.id},repos);
    const fresh=createPrismaRepositories(reload);
    assert.deepEqual((await fresh.research.latestByProduct(productId))?.competitorSnapshot,research.competitorSnapshot);
    const versions=await fresh.listings.listByProduct(productId);
    assert.deepEqual(versions.map(row=>row.version),[2,1]);
    assert.equal(versions[0].titleZh,output.titleZh);
    assert.deepEqual(versions[0].bulletsZh,output.bulletPointsZh);
    assert.deepEqual(versions[0].researchContext,first.researchContext);
    assert.deepEqual(versions[0].aiUsage,first.aiUsage);
  } finally {
    if(productId)await client.product.delete({where:{id:productId}});
    await client.$disconnect();
    await reload.$disconnect();
  }
});
