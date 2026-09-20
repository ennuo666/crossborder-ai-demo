import test from "node:test";
import assert from "node:assert/strict";
import { createResearchAiAdapter } from "@/adapters/ai/research-adapter";
import { mockMarketplaceProvider } from "@/marketplace/providers/mock-marketplace-provider";
import { calculateCompetitorStats } from "@/marketplace/stats";
test("research includes all saved samples and requests Chinese insights", async () => {
  const { products } = await mockMarketplaceProvider.search({ query: "charger" });
  const samples = [...products, ...products.map(product => ({ ...product, externalId: product.externalId + "extra" }))];
  let count = 0;
  const adapter = createResearchAiAdapter({ name: "fake", async completeJson(request) {
    assert.match(request.system, /简体中文/); count = JSON.parse(request.user).competitors.length;
    return { coreSellingPoints:["卖点"], userPainPoints:["痛点"], targetUsers:["用户"], competitorDifferentiators:["机会"], recommendedKeywords:["charger"], risks:[] };
  } });
  assert.equal((await adapter.analyzeCompetitor({ productName: "charger", competitors: samples })).state, "succeeded");
  assert.equal(count, samples.length);
  assert.equal(calculateCompetitorStats([{ ...products[0], price: 10 }, { ...products[1], price: 20 }]).medianPrice, 15);
});
