export type AdapterTaskState = "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type AdapterResult<T> = { state: AdapterTaskState; data?: T; error?: { code: string; message: string }; source: "mock" | "external" };
export interface ResearchAdapter { analyzeCompetitor(input: { productName: string }): Promise<AdapterResult<unknown>>; }
export interface AssetAdapter { generateProductImages(input: { productName: string }): Promise<AdapterResult<unknown>>; }
export interface SeoAdapter { runSeoAudit(input: { productName: string }): Promise<AdapterResult<unknown>>; }
