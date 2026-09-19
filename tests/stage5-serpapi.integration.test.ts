import test from "node:test";
import assert from "node:assert/strict";
import { SerpApiAmazonProvider } from "@/marketplace/providers/serpapi-amazon-provider";
test("SerpApi opt-in integration", { skip: !(process.env.SERPAPI_API_KEY && process.env.RUN_SERPAPI_INTEGRATION === "1") }, async()=>{ const result=await new SerpApiAmazonProvider(process.env.SERPAPI_API_KEY!).search({query:process.env.SERPAPI_TEST_QUERY||"wireless charger",marketplace:process.env.SERPAPI_AMAZON_DOMAIN||"amazon.com",limit:5}); assert.ok(result.products.length>0); assert.ok(result.products[0].externalId); });
