import test from "node:test";
import assert from "node:assert/strict";
import { listingGenerationSchema, researchAnalysisSchema } from "@/ai/schemas";
import { createResearchAiAdapter } from "@/adapters/ai/research-adapter";
import { createListingAiAdapter } from "@/adapters/ai/listing-adapter";
import type { AiProvider } from "@/ai/types";

test("AI schemas validate structured research and listing output", () => {
  assert.ok(researchAnalysisSchema.safeParse({ coreSellingPoints:["fast"], userPainPoints:["slow"], targetUsers:["families"], competitorDifferentiators:["compact"], recommendedKeywords:["filter"], risks:["sample"], competitorCount:2, coverage:"80%", priceRange:"$20", opportunities:["fast"] }).success);
  assert.ok(!listingGenerationSchema.safeParse({ title:"", bulletPoints:[], description:"", keywords:[] }).success);
});

test("research adapter retries malformed provider output", async () => {
  let calls = 0;
  const provider: AiProvider = { name:"fake", async completeJson() { calls++; return calls === 1 ? { bad:true } : { coreSellingPoints:["fast"], userPainPoints:["slow"], targetUsers:["families"], competitorDifferentiators:["compact"], recommendedKeywords:["filter"], risks:["sample"], competitorCount:2, coverage:"80%", priceRange:"$20", opportunities:["fast"] }; } };
  const result = await createResearchAiAdapter(provider).analyzeCompetitor({productName:"Filter"});
  assert.equal(result.state, "succeeded"); assert.equal(calls, 2);
});

test("listing adapter returns a bounded failure for invalid output", async () => {
  const provider: AiProvider = { name:"fake", async completeJson() { return { title:"bad" }; } };
  const result = await createListingAiAdapter(provider).generateListing({productName:"Filter"});
  assert.equal(result.state, "failed"); assert.equal(result.error?.code, "AI_RESPONSE_INVALID");
});
