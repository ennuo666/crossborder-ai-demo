import type { AssetAdapter, ListingAdapter, ResearchAdapter, SeoAdapter } from "@/adapters/types";

export const mockResearchAdapter: ResearchAdapter = { async analyzeCompetitor() { return { state: "succeeded", source: "mock", data: { competitorCount: 24, coverage: "82%", priceRange: "$28 — $42", opportunities: ["过滤速度快", "一键更换滤芯", "适配冰箱门"] } }; } };
export const mockAssetAdapter: AssetAdapter = { async generateProductImages() { return { state: "succeeded", source: "mock", data: { assets: 4 } }; } };
export const mockSeoAdapter: SeoAdapter = { async runSeoAudit() { return { state: "succeeded", source: "mock", data: { score: 82 } }; } };
export const mockListingAdapter: ListingAdapter = { async generateListing() { return { state: "succeeded", source: "mock", data: { title: "PureFlow 便携式净水滤芯水壶，2.4 倍快速过滤", bullets: ["快速过滤"], keywords: ["water filter pitcher"] } }; } };
