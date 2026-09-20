import { NextResponse } from "next/server";
import { authenticated } from "@/lib/api-auth";
import { getRepositories } from "@/repositories";
import { forUser } from "@/services/ownership-service";
import { createTask } from "@/services/task-service";
import { taskQueue } from "@/task-queue/in-process-queue";
import type { TaskType } from "@/lib/types";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  return authenticated(request, async userId => {
    const { id } = await context.params;
    const repositories = getRepositories();
    await forUser(userId, repositories).product(id);
    return NextResponse.json({ tasks: await repositories.tasks.listByProduct(id) });
  });
}
export async function POST(request: Request, context: Context) {
  return authenticated(request, async userId => {
    const { id } = await context.params;
    const repositories = getRepositories();
    await forUser(userId, repositories).product(id);
    const body = await request.json().catch(() => ({}));
    const type = body.type as TaskType;
    if (!["RESEARCH", "LISTING_GENERATION", "ASSET_GENERATION", "SEO_AUDIT"].includes(type)) return NextResponse.json({ error: "不支持的任务类型" }, { status: 400 });
    const task = await createTask(id, type, undefined, repositories);
    await taskQueue.enqueue(task.id);
    return NextResponse.json({ taskId: task.id, status: task.status, task }, { status: 202 });
  });
}
