import { products as mockProducts } from "@/lib/mock-data";
import type { AssetRecord, ListingRecord, ProductRecord, ResearchResultRecord, SeoAuditRecord, TaskRecord } from "@/lib/types";
import type { AssetCreateInput, ListingCreateInput, ProductCreateInput, RepositoryBundle, ResearchCreateInput, SeoAuditCreateInput, TaskCreateInput, TaskRepository, TaskUpdateInput } from "./types";

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function createInMemoryRepositories(seed = false): RepositoryBundle {
  const productRows: ProductRecord[] = seed ? mockProducts.map(product => ({ id: product.id, name: product.name, subtitle: product.subtitle, market: product.market, channel: product.channel, status: product.status, progress: product.progress, createdAt: now(), updatedAt: now() })) : [];
  const taskRows: TaskRecord[] = [];
  const listingRows: ListingRecord[] = [];
  const researchRows: ResearchResultRecord[] = [];
  const assetRows: AssetRecord[] = [];
  const seoRows: SeoAuditRecord[] = [];

  const productsRepo = {
    async list() { return [...productRows].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); },
    async findById(productId: string) { return productRows.find(row => row.id === productId) ?? null; },
    async create(input: ProductCreateInput) { const timestamp = now(); const row: ProductRecord = { id: id("product"), name: input.name, subtitle: input.subtitle ?? null, market: input.market, channel: input.channel, status: "待研究", progress: 0, createdAt: timestamp, updatedAt: timestamp }; productRows.push(row); return row; },
  };
  const tasksRepo: TaskRepository = {
    async create(input: TaskCreateInput) { const timestamp = now(); const row: TaskRecord = { id: id("task"), productId: input.productId, type: input.type, status: "queued", progress: 0, input: input.input ?? null, output: null, errorCode: null, errorMessage: null, retryCount: 0, startedAt: null, finishedAt: null, createdAt: timestamp, updatedAt: timestamp }; taskRows.push(row); return row; },
    async findById(taskId: string) { return taskRows.find(row => row.id === taskId) ?? null; },
    async update(taskId: string, input: TaskUpdateInput) { const row = taskRows.find(item => item.id === taskId); if (!row) throw new Error("TASK_NOT_FOUND"); Object.assign(row, input, { updatedAt: now() }); return row; },
    async listByProduct(productId: string) { return taskRows.filter(row => row.productId === productId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
  };
  const listingsRepo = { async create(input: ListingCreateInput) { const versions = listingRows.filter(row => row.productId === input.productId); const timestamp = now(); const row: ListingRecord = { id: id("listing"), productId: input.productId, taskId: input.taskId ?? null, version: versions.length + 1, title: input.title, bullets: input.bullets, description: input.description ?? null, keywords: input.keywords, status: input.status ?? "draft", aiUsage: input.aiUsage ?? null, createdAt: timestamp, updatedAt: timestamp }; listingRows.push(row); return row; }, async latestByProduct(productId: string) { return [...listingRows].filter(row => row.productId === productId).sort((a, b) => b.version - a.version)[0] ?? null; }, async listByProduct(productId: string) { return listingRows.filter(row => row.productId === productId).sort((a, b) => b.version - a.version); } };
  const researchRepo = { async create(input: ResearchCreateInput) { const row: ResearchResultRecord = { ...input, id: id("research"), createdAt: now() }; researchRows.push(row); return row; }, async latestByProduct(productId: string) { return [...researchRows].filter(row => row.productId === productId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null; } };
  const assetsRepo = { async create(input: AssetCreateInput) { const row: AssetRecord = { ...input, id: id("asset"), createdAt: now() }; assetRows.push(row); return row; }, async listByProduct(productId: string) { return assetRows.filter(row => row.productId === productId); } };
  const seoRepo = { async create(input: SeoAuditCreateInput) { const row: SeoAuditRecord = { ...input, id: id("seo"), createdAt: now() }; seoRows.push(row); return row; }, async latestByProduct(productId: string) { return [...seoRows].filter(row => row.productId === productId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null; } };
  return { products: productsRepo, tasks: tasksRepo, listings: listingsRepo, research: researchRepo, assets: assetsRepo, seoAudits: seoRepo };
}


