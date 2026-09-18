import { Prisma, PrismaClient, TaskStatus as PrismaTaskStatus, TaskType as PrismaTaskType } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";
import type { AssetRecord, ListingRecord, ProductRecord, ResearchResultRecord, SeoAuditRecord, TaskRecord } from "@/lib/types";
import type { AssetCreateInput, ListingCreateInput, ProductCreateInput, RepositoryBundle, ResearchCreateInput, SeoAuditCreateInput, TaskCreateInput, TaskUpdateInput } from "./types";

type Client = PrismaClient;
const json = (value: unknown) => value as Prisma.InputJsonValue;
const toProduct = (row: Awaited<ReturnType<Client["product"]["findFirst"]>>): ProductRecord | null => row ? { ...row, subtitle: row.subtitle, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() } : null;
const toTask = (row: { id: string; productId: string; type: PrismaTaskType; status: PrismaTaskStatus; progress: number; input: Prisma.JsonValue | null; output: Prisma.JsonValue | null; errorCode: string | null; errorMessage: string | null; retryCount: number; createdAt: Date; updatedAt: Date }): TaskRecord => ({ ...row, type: row.type, status: row.status, input: row.input, output: row.output, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });

export function createPrismaRepositories(client: Client = defaultPrisma): RepositoryBundle {
  return {
    products: {
      async list() { const rows = await client.product.findMany({ orderBy: { updatedAt: "desc" } }); return rows.map(row => ({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() })); },
      async findById(id: string) { return toProduct(await client.product.findUnique({ where: { id } })); },
      async create(input: ProductCreateInput) { const row = await client.product.create({ data: { name: input.name, subtitle: input.subtitle ?? null, market: input.market, channel: input.channel } }); return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() }; },
    },
    tasks: {
      async create(input: TaskCreateInput) { const row = await client.task.create({ data: { productId: input.productId, type: input.type as PrismaTaskType, input: input.input === undefined ? undefined : json(input.input) } }); return toTask(row); },
      async findById(id: string) { const row = await client.task.findUnique({ where: { id } }); return row ? toTask(row) : null; },
      async update(id: string, input: TaskUpdateInput) { const row = await client.task.update({ where: { id }, data: { status: input.status as PrismaTaskStatus | undefined, progress: input.progress, output: input.output === undefined ? undefined : json(input.output), errorCode: input.errorCode, errorMessage: input.errorMessage, retryCount: input.retryCount } }); return toTask(row); },
      async listByProduct(productId: string) { const rows = await client.task.findMany({ where: { productId }, orderBy: { createdAt: "desc" } }); return rows.map(toTask); },
    },
    listings: {
      async create(input: ListingCreateInput) { const current = await client.listing.aggregate({ where: { productId: input.productId }, _max: { version: true } }); const row = await client.listing.create({ data: { productId: input.productId, taskId: input.taskId ?? null, version: (current._max.version ?? 0) + 1, title: input.title, bullets: json(input.bullets), description: input.description ?? null, keywords: json(input.keywords), status: input.status ?? "draft" } }); return toListing(row); },
      async latestByProduct(productId: string) { const row = await client.listing.findFirst({ where: { productId }, orderBy: { version: "desc" } }); return row ? toListing(row) : null; },
      async listByProduct(productId: string) { const rows = await client.listing.findMany({ where: { productId }, orderBy: { version: "desc" } }); return rows.map(toListing); },
    },
    research: {
      async create(input: ResearchCreateInput) { const row = await client.researchResult.create({ data: { productId: input.productId, taskId: input.taskId, competitorCount: input.competitorCount, coverage: input.coverage, priceRange: input.priceRange, opportunities: json(input.opportunities), coreSellingPoints: json(input.coreSellingPoints), userPainPoints: json(input.userPainPoints), targetUsers: json(input.targetUsers), competitorDifferentiators: json(input.competitorDifferentiators), recommendedKeywords: json(input.recommendedKeywords), risks: json(input.risks), source: input.source, marketplace: input.marketplace, query: input.query, competitorIds: json(input.competitorIds), fetchedAt: new Date(input.fetchedAt), stats: json(input.stats) } }); return toResearch(row); },
      async latestByProduct(productId: string) { const row = await client.researchResult.findFirst({ where: { productId }, orderBy: { createdAt: "desc" } }); return row ? toResearch(row) : null; },
    },
    assets: {
      async create(input: AssetCreateInput) { const row = await client.asset.create({ data: { productId: input.productId, taskId: input.taskId, kind: input.kind, name: input.name, url: input.url, metadata: json(input.metadata), status: input.status } }); return toAsset(row); },
      async listByProduct(productId: string) { const rows = await client.asset.findMany({ where: { productId }, orderBy: { createdAt: "desc" } }); return rows.map(toAsset); },
    },
    seoAudits: {
      async create(input: SeoAuditCreateInput) { const row = await client.seoAudit.create({ data: { productId: input.productId, taskId: input.taskId, score: input.score, issueCount: input.issueCount, details: json(input.details), status: input.status } }); return toSeo(row); },
      async latestByProduct(productId: string) { const row = await client.seoAudit.findFirst({ where: { productId }, orderBy: { createdAt: "desc" } }); return row ? toSeo(row) : null; },
    },
  };
}

function toListing(row: { id: string; productId: string; taskId: string | null; version: number; title: string; bullets: Prisma.JsonValue; description: string | null; keywords: Prisma.JsonValue; status: string; createdAt: Date; updatedAt: Date }): ListingRecord { return { ...row, taskId: row.taskId, bullets: Array.isArray(row.bullets) ? row.bullets.map(String) : [], keywords: Array.isArray(row.keywords) ? row.keywords.map(String) : [], createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() }; }
function toResearch(row: { id: string; productId: string; taskId: string | null; competitorCount: number; coverage: string; priceRange: string; opportunities: Prisma.JsonValue; coreSellingPoints: Prisma.JsonValue; userPainPoints: Prisma.JsonValue; targetUsers: Prisma.JsonValue; competitorDifferentiators: Prisma.JsonValue; recommendedKeywords: Prisma.JsonValue; risks: Prisma.JsonValue; source: string; marketplace: string; query: string; competitorIds: Prisma.JsonValue; fetchedAt: Date; stats: Prisma.JsonValue; createdAt: Date }): ResearchResultRecord { return { ...row, opportunities: Array.isArray(row.opportunities) ? row.opportunities.map(String) : [], coreSellingPoints: Array.isArray(row.coreSellingPoints) ? row.coreSellingPoints.map(String) : [], userPainPoints: Array.isArray(row.userPainPoints) ? row.userPainPoints.map(String) : [], targetUsers: Array.isArray(row.targetUsers) ? row.targetUsers.map(String) : [], competitorDifferentiators: Array.isArray(row.competitorDifferentiators) ? row.competitorDifferentiators.map(String) : [], recommendedKeywords: Array.isArray(row.recommendedKeywords) ? row.recommendedKeywords.map(String) : [], risks: Array.isArray(row.risks) ? row.risks.map(String) : [], competitorIds: Array.isArray(row.competitorIds) ? row.competitorIds.map(String) : [], stats: row.stats && typeof row.stats === "object" && !Array.isArray(row.stats) ? row.stats as Record<string, unknown> : {}, fetchedAt: row.fetchedAt.toISOString(), createdAt: row.createdAt.toISOString() }; }
function toAsset(row: { id: string; productId: string; taskId: string | null; kind: string; name: string; url: string | null; metadata: Prisma.JsonValue; status: string; createdAt: Date }): AssetRecord { return { ...row, metadata: row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata) ? row.metadata as Record<string, unknown> : {}, createdAt: row.createdAt.toISOString() }; }
function toSeo(row: { id: string; productId: string; taskId: string | null; score: number; issueCount: number; details: Prisma.JsonValue; status: string; createdAt: Date }): SeoAuditRecord { return { ...row, details: row.details && typeof row.details === "object" && !Array.isArray(row.details) ? row.details as Record<string, unknown> : {}, createdAt: row.createdAt.toISOString() }; }


