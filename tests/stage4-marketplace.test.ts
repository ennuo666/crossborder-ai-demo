import test from "node:test";
import assert from "node:assert/strict";
import { normalizeCompetitorProduct } from "@/marketplace/normalize";
import { calculateCompetitorStats } from "@/marketplace/stats";
import { mockMarketplaceProvider } from "@/marketplace/providers/mock-marketplace-provider";
test("normalization tolerates missing fields and rejects missing id",()=>{assert.equal(normalizeCompetitorProduct({title:"x"}),null); const row=normalizeCompetitorProduct({asin:"A1",price:10,rating:6,reviewCount:-1}); assert.equal(row?.rating,5); assert.equal(row?.reviewCount,null);});
test("stats are computed deterministically",async()=>{const products=await mockMarketplaceProvider.search({query:"filter",limit:3}); const stats=calculateCompetitorStats(products.products); assert.equal(stats.competitorCount,3); assert.equal(stats.priceRange,"20 — 26"); assert.equal(stats.medianPrice,23);});
test("mock marketplace returns normalized products",async()=>{const result=await mockMarketplaceProvider.search({query:"filter",limit:2}); assert.equal(result.products.length,2); assert.equal(result.products[0].marketplace,"amazon");});

