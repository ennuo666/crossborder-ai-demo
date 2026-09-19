import type { ResearchAnalysis, ListingGeneration } from "@/ai/schemas";
import type { AiUsage } from "@/ai/types";
import type { CompetitorProduct } from "@/marketplace/types";
export type AdapterTaskState = "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type AdapterResult<T> = { state: AdapterTaskState; data?: T; error?: { code: string; message: string }; source: "mock" | "external"; usage?: { provider:string; model?:string; latencyMs:number; inputTokens?:number; outputTokens?:number; totalTokens?:number } };
export interface ResearchAdapter { analyzeCompetitor(input: { productName: string; competitors?: CompetitorProduct[]; stats?: Record<string, unknown> }): Promise<AdapterResult<ResearchAnalysis>>; }
export interface ListingAdapter { generateListing(input: { productName: string; research?: unknown }): Promise<AdapterResult<ListingGeneration>>; }
export interface AssetAdapter { generateProductImages(input: { productName: string }): Promise<AdapterResult<unknown>>; }
export interface SeoAdapter { runSeoAudit(input: { productName: string }): Promise<AdapterResult<unknown>>; }

