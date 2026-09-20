import { mockListingOutput } from "@/ai/mock-listing";
import type { AssetAdapter, ListingAdapter, ResearchAdapter, SeoAdapter } from "@/adapters/types";
export const mockResearchAdapter: ResearchAdapter = { async analyzeCompetitor() { return { state:"succeeded", source:"mock", data:{ coreSellingPoints:["快速"], userPainPoints:["更换复杂"], targetUsers:["家庭"], competitorDifferentiators:["便携"], recommendedKeywords:["water filter"], risks:["需复核"], competitorCount:0, coverage:"", priceRange:"", opportunities:[] } }; } };
export const mockAssetAdapter: AssetAdapter = { async generateProductImages() { return { state:"succeeded", source:"mock", data:{assets:4} }; } };
export const mockSeoAdapter: SeoAdapter = { async runSeoAudit() { return { state:"succeeded", source:"mock", data:{score:82} }; } };
export const mockListingAdapter: ListingAdapter = { async generateListing() { return { state:"succeeded", source:"mock", data:mockListingOutput }; } };
