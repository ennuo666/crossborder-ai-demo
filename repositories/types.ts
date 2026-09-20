import type { AssetRecord, ListingRecord, ProductRecord, ResearchResultRecord, SeoAuditRecord, TaskRecord, TaskStatus, TaskType } from "@/lib/types";

export type ProductCreateInput = { name: string; market: string; channel: string; subtitle?: string | null; userId?: string | null };
export type TaskCreateInput = { productId: string; type: TaskType; input?: unknown };
export type TaskUpdateInput = Partial<Pick<TaskRecord, "status" | "progress" | "output" | "errorCode" | "errorMessage" | "retryCount" | "startedAt" | "finishedAt">>;
export type ListingCreateInput = { productId: string; taskId?: string | null; title: string; bullets: string[]; description?: string | null; keywords: string[]; status?: string; aiUsage?: import("@/lib/types").AiUsageRecord | null };
export type ResearchCreateInput = Omit<ResearchResultRecord, "id" | "createdAt">;
export type AssetCreateInput = Omit<AssetRecord, "id" | "createdAt">;
export type SeoAuditCreateInput = Omit<SeoAuditRecord, "id" | "createdAt">;

export interface ProductRepository { listForUser(userId: string): Promise<ProductRecord[]>; findForUser(id: string, userId: string): Promise<ProductRecord | null>; list(): Promise<ProductRecord[]>; findById(id: string): Promise<ProductRecord | null>; create(input: ProductCreateInput): Promise<ProductRecord>; }
export interface TaskRepository { findForUser(id: string, userId: string): Promise<TaskRecord | null>; create(input: TaskCreateInput): Promise<TaskRecord>; findById(id: string): Promise<TaskRecord | null>; update(id: string, input: TaskUpdateInput): Promise<TaskRecord>; listByProduct(productId: string): Promise<TaskRecord[]>; listByStatus(status: TaskStatus): Promise<TaskRecord[]>; }
export interface ListingRepository { create(input: ListingCreateInput): Promise<ListingRecord>; latestByProduct(productId: string): Promise<ListingRecord | null>; listByProduct(productId: string): Promise<ListingRecord[]>; }
export interface ResearchRepository { create(input: ResearchCreateInput): Promise<ResearchResultRecord>; latestByProduct(productId: string): Promise<ResearchResultRecord | null>; }
export interface AssetRepository { create(input: AssetCreateInput): Promise<AssetRecord>; listByProduct(productId: string): Promise<AssetRecord[]>; }
export interface SeoAuditRepository { create(input: SeoAuditCreateInput): Promise<SeoAuditRecord>; latestByProduct(productId: string): Promise<SeoAuditRecord | null>; }

export type RepositoryBundle = { products: ProductRepository; tasks: TaskRepository; listings: ListingRepository; research: ResearchRepository; assets: AssetRepository; seoAudits: SeoAuditRepository };
export type TaskStatusValue = TaskStatus;
