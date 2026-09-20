-- AlterTable
ALTER TABLE "public"."ResearchResult" ADD COLUMN     "competitorSnapshot" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "public"."Listing" ADD COLUMN     "bulletsZh" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "descriptionZh" TEXT,
ADD COLUMN     "researchContext" JSONB,
ADD COLUMN     "titleZh" TEXT;
