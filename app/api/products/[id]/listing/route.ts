import { NextResponse } from "next/server";
import { getRepositories } from "@/repositories";
import { getProduct } from "@/services/product-service";
import { getLatestListing, saveListing } from "@/services/listing-service";
import { createTask } from "@/services/task-service";
import { taskQueue } from "@/task-queue/in-process-queue";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return NextResponse.json({ listing: await getLatestListing(id) });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  if (body.action === "generate") { const task = await createTask(id, "LISTING_GENERATION", undefined, getRepositories()); await taskQueue.enqueue(task.id); return NextResponse.json({ taskId: task.id, status: task.status, task }, { status: 202 }); }
  if (typeof body.title !== "string" || !body.title.trim()) return NextResponse.json({ error: "Listing 标题不能为空" }, { status: 400 });
  const listing = await saveListing(id, { title: body.title, bullets: Array.isArray(body.bullets) ? body.bullets.map(String) : [], description: typeof body.description === "string" ? body.description : null, keywords: Array.isArray(body.keywords) ? body.keywords.map(String) : [] }, getRepositories());
  return NextResponse.json({ listing }, { status: 201 });
}


