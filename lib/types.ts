export type ViewKey = "overview" | "products" | "research" | "listing" | "assets" | "store" | "seo" | "tasks" | "settings";

export type TaskStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type TaskType = "RESEARCH" | "LISTING_GENERATION" | "ASSET_GENERATION" | "SEO_AUDIT";

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  market: string;
  channel: string;
  status: string;
  progress: number;
  updatedAt: string;
};

export type Task = { id: string; title: string; detail: string; status: TaskStatus; time: string };

export type ProductRecord = {
  id: string;
  name: string;
  subtitle: string | null;
  market: string;
  channel: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

export type TaskRecord = {
  id: string;
  productId: string;
  type: TaskType;
  status: TaskStatus;
  progress: number;
  input: unknown;
  output: unknown;
  errorCode: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AiUsageRecord = { provider:string; model?:string; latencyMs:number; inputTokens?:number; outputTokens?:number; totalTokens?:number };
export type ListingRecord = {
  id: string;
  productId: string;
  taskId: string | null;
  version: number;
  title: string;
  bullets: string[];
  description: string | null;
  keywords: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  aiUsage?: AiUsageRecord | null;
};

export type ResearchResultRecord = { id: string; productId: string; taskId: string | null; competitorCount: number; coverage: string; priceRange: string; opportunities: string[]; coreSellingPoints: string[]; userPainPoints: string[]; targetUsers: string[]; competitorDifferentiators: string[]; recommendedKeywords: string[]; risks: string[]; source: string; marketplace: string; query: string; competitorIds: string[]; fetchedAt: string; stats: Record<string, unknown>; aiUsage?: AiUsageRecord | null; createdAt: string };
export type AssetRecord = { id: string; productId: string; taskId: string | null; kind: string; name: string; url: string | null; metadata: Record<string, unknown>; status: string; createdAt: string };
export type SeoAuditRecord = { id: string; productId: string; taskId: string | null; score: number; issueCount: number; details: Record<string, unknown>; status: string; createdAt: string };

