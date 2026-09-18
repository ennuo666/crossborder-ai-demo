import { NextResponse } from "next/server";
import { getRepositories } from "@/repositories";
import { getProduct } from "@/services/product-service";
import { getLatestListing } from "@/services/listing-service";
import { listTasks } from "@/services/task-service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const repositories = getRepositories();
  const product = await getProduct(id, repositories);
  if (!product) return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  const [listing, research, assets, seoAudit, tasks] = await Promise.all([getLatestListing(id, repositories), repositories.research.latestByProduct(id), repositories.assets.listByProduct(id), repositories.seoAudits.latestByProduct(id), listTasks(id, repositories)]);
  return NextResponse.json({ product, listing, research, assets, seoAudit, tasks });
}
