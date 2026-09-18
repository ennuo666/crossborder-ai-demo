import { NextResponse } from "next/server";
import { createProduct, listProducts } from "@/services/product-service";

export async function GET() {
  return NextResponse.json({ products: await listProducts() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (typeof body.name !== "string" || !body.name.trim()) return NextResponse.json({ error: "商品名称不能为空" }, { status: 400 });
  const result = await createProduct({ name: body.name, market: typeof body.market === "string" ? body.market : "美国", channel: typeof body.channel === "string" ? body.channel : "Amazon US" });
  return NextResponse.json(result, { status: 201 });
}
