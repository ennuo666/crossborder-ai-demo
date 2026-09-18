import { NextResponse } from "next/server";
import { getRepositories } from "@/repositories";
import { getProduct } from "@/services/product-service";
import { listTasks } from "@/services/task-service";
import { startResearch } from "@/services/research-service";
import { startListingGeneration } from "@/services/listing-service";
import { startAssetGeneration } from "@/services/asset-service";
import { startSeoAudit } from "@/services/seo-service";
import type { TaskType } from "@/lib/types";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return NextResponse.json({ tasks: await listTasks(id) });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const type = body.type as TaskType;
  const repositories = getRepositories();
  const task = type === "RESEARCH" ? await startResearch(id, undefined, repositories) : type === "LISTING_GENERATION" ? await startListingGeneration(id, repositories) : type === "ASSET_GENERATION" ? await startAssetGeneration(id, repositories) : type === "SEO_AUDIT" ? await startSeoAudit(id, repositories) : null;
  if (!task) return NextResponse.json({ error: "不支持的任务类型" }, { status: 400 });
  return NextResponse.json({ task }, { status: 202 });
}
