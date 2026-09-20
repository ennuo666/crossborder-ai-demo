import { NextResponse } from "next/server";
import { authenticated } from "@/lib/api-auth";
import { getRepositories } from "@/repositories";
import { forUser } from "@/services/ownership-service";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return authenticated(request, async userId => NextResponse.json({ task: await forUser(userId, getRepositories()).task((await context.params).id) }));
}
