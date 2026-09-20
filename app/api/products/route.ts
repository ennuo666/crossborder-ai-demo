import { NextResponse } from "next/server";
import { authenticated } from "@/lib/api-auth";
import { getRepositories } from "@/repositories";
import { forUser } from "@/services/ownership-service";

export async function GET(request: Request) {
  return authenticated(request, async userId => NextResponse.json({ products: await forUser(userId, getRepositories()).list() }));
}
export async function POST(request: Request) {
  return authenticated(request, async userId => {
    const body = await request.json().catch(() => ({}));
    if (typeof body.name !== "string" || !body.name.trim()) return NextResponse.json({ error: "商品名称不能为空" }, { status: 400 });
    const product = await getRepositories().products.create({ userId, name: body.name.trim(), market: typeof body.market === "string" ? body.market : "美国", channel: typeof body.channel === "string" ? body.channel : "Amazon US" });
    return NextResponse.json({ product }, { status: 201 });
  });
}
