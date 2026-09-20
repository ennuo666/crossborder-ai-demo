import { NextResponse } from "next/server";
import { authenticated } from "@/lib/api-auth";
import { getRepositories } from "@/repositories";
import { forUser } from "@/services/ownership-service";

export async function GET(request: Request) {
  return authenticated(request, async userId => {
    const repositories=getRepositories();
    const products=await forUser(userId,repositories).list();
    const summaries:import("@/lib/types").ProductSummary[]=await Promise.all(products.map(async product=>{
      const [research,listings,tasks]=await Promise.all([repositories.research.latestByProduct(product.id),repositories.listings.listByProduct(product.id),repositories.tasks.listByProduct(product.id)]);
      const latest=listings[0];
      return {productId:product.id,research:research?{id:research.id,competitorCount:research.competitorCount,createdAt:research.createdAt}:null,listingCount:listings.length,latestListing:latest?{id:latest.id,version:latest.version,createdAt:latest.createdAt}:null,tasks:tasks.map(task=>({...task,input:null,output:null}))};
    }));
    const recentTasks=summaries.flatMap(summary=>summary.tasks).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,20);
    return NextResponse.json({products,summaries,recentTasks});
  });
}
export async function POST(request: Request) {
  return authenticated(request, async userId => {
    const body = await request.json().catch(() => ({}));
    if (typeof body.name !== "string" || !body.name.trim()) return NextResponse.json({ error: "商品名称不能为空" }, { status: 400 });
    const product = await getRepositories().products.create({ userId, name: body.name.trim(), market: typeof body.market === "string" ? body.market : "美国", channel: typeof body.channel === "string" ? body.channel : "Amazon US" });
    return NextResponse.json({ product }, { status: 201 });
  });
}
