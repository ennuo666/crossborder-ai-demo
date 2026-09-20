import { mockListingOutput } from "../mock-listing";
import type { AiCompletionRequest, AiProvider } from "../types";
export class MockAiProvider implements AiProvider { readonly name="mock" as const; async completeJson(request: AiCompletionRequest): Promise<unknown> { if (request.responseSchemaName === "research-analysis") return {coreSellingPoints:["快速"],userPainPoints:["更换复杂"],targetUsers:["家庭"],competitorDifferentiators:["便携"],recommendedKeywords:["water filter"],risks:["需复核"],competitorCount:24,coverage:"82%",priceRange:"$28 — $42",opportunities:["快速"]}; return mockListingOutput; } }
