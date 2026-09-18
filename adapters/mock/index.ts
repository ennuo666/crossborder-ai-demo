import type { AssetAdapter, ResearchAdapter, SeoAdapter } from "@/adapters/types";

export const mockResearchAdapter: ResearchAdapter = { async analyzeCompetitor() { return { state: "succeeded", source: "mock", data: { competitors: 24 } }; } };
export const mockAssetAdapter: AssetAdapter = { async generateProductImages() { return { state: "succeeded", source: "mock", data: { assets: 4 } }; } };
export const mockSeoAdapter: SeoAdapter = { async runSeoAudit() { return { state: "succeeded", source: "mock", data: { score: 82 } }; } };
