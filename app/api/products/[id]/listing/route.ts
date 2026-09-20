import { NextResponse } from "next/server";
import { authenticated } from "@/lib/api-auth";
import { getRepositories } from "@/repositories";
import { forUser } from "@/services/ownership-service";
import { saveListing } from "@/services/listing-service";
import { createTask } from "@/services/task-service";
import { taskQueue } from "@/task-queue/in-process-queue";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  return authenticated(request, async userId => {
    const { id } = await context.params;
    const repositories = getRepositories();
    await forUser(userId, repositories).product(id);
    return NextResponse.json({ listing: await repositories.listings.latestByProduct(id) });
  });
}
export async function POST(request: Request, context: Context) {
  return authenticated(request, async userId => {
    const { id } = await context.params;
    const repositories = getRepositories();
    await forUser(userId, repositories).product(id);
    const body = await request.json().catch(() => ({}));
    if (body.action === "generate") {
      const task = await createTask(id, "LISTING_GENERATION", undefined, repositories);
      await taskQueue.enqueue(task.id);
      return NextResponse.json({ taskId: task.id, status: task.status, task }, { status: 202 });
    }
    if (typeof body.title !== "string" || !body.title.trim()) return NextResponse.json({ error: "Listing 标题不能为空" }, { status: 400 });
    const listing = await saveListing(id, { title: body.title, bullets: Array.isArray(body.bullets) ? body.bullets.map(String) : [], description: typeof body.description === "string" ? body.description : null, keywords: Array.isArray(body.keywords) ? body.keywords.map(String) : [] }, repositories);
    return NextResponse.json({ listing }, { status: 201 });
  });
}
