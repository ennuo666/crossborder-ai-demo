-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."TaskType" AS ENUM ('RESEARCH', 'LISTING_GENERATION', 'ASSET_GENERATION', 'SEO_AUDIT');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed', 'cancelled');

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "market" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT '待研究',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "public"."TaskType" NOT NULL,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'queued',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "input" JSONB,
    "output" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ResearchResult" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "taskId" TEXT,
    "competitorCount" INTEGER NOT NULL,
    "coverage" TEXT NOT NULL,
    "priceRange" TEXT NOT NULL,
    "opportunities" JSONB NOT NULL,
    "coreSellingPoints" JSONB NOT NULL,
    "userPainPoints" JSONB NOT NULL,
    "targetUsers" JSONB NOT NULL,
    "competitorDifferentiators" JSONB NOT NULL,
    "recommendedKeywords" JSONB NOT NULL,
    "risks" JSONB NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'mock',
    "marketplace" TEXT NOT NULL DEFAULT 'mock',
    "query" TEXT NOT NULL DEFAULT '',
    "competitorIds" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "stats" JSONB NOT NULL,
    "aiUsage" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Listing" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "taskId" TEXT,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "bullets" JSONB NOT NULL,
    "description" TEXT,
    "keywords" JSONB NOT NULL,
    "aiUsage" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Asset" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "taskId" TEXT,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "metadata" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ready',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SeoAudit" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "taskId" TEXT,
    "score" INTEGER NOT NULL,
    "issueCount" INTEGER NOT NULL,
    "details" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_updatedAt_idx" ON "public"."Product"("updatedAt");

-- CreateIndex
CREATE INDEX "Task_productId_createdAt_idx" ON "public"."Task"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "public"."Task"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchResult_taskId_key" ON "public"."ResearchResult"("taskId");

-- CreateIndex
CREATE INDEX "ResearchResult_productId_createdAt_idx" ON "public"."ResearchResult"("productId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_taskId_key" ON "public"."Listing"("taskId");

-- CreateIndex
CREATE INDEX "Listing_productId_updatedAt_idx" ON "public"."Listing"("productId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_productId_version_key" ON "public"."Listing"("productId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_taskId_key" ON "public"."Asset"("taskId");

-- CreateIndex
CREATE INDEX "Asset_productId_createdAt_idx" ON "public"."Asset"("productId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SeoAudit_taskId_key" ON "public"."SeoAudit"("taskId");

-- CreateIndex
CREATE INDEX "SeoAudit_productId_createdAt_idx" ON "public"."SeoAudit"("productId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ResearchResult" ADD CONSTRAINT "ResearchResult_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ResearchResult" ADD CONSTRAINT "ResearchResult_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Listing" ADD CONSTRAINT "Listing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Listing" ADD CONSTRAINT "Listing_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Asset" ADD CONSTRAINT "Asset_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Asset" ADD CONSTRAINT "Asset_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeoAudit" ADD CONSTRAINT "SeoAudit_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeoAudit" ADD CONSTRAINT "SeoAudit_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

