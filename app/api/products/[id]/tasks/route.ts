import { NextResponse } from "next/server";
import { getRepositories } from "@/repositories";
import { getProduct } from "@/services/product-service";
import { createTask } from "@/services/task-service";
import { taskQueue } from "@/task-queue/in-process-queue";
import type { TaskType } from "@/lib/types";
export async function GET(_request:Request,context:{params:Promise<{id:string}>}){const {id}=await context.params; return NextResponse.json({tasks:await getRepositories().tasks.listByProduct(id)});}
export async function POST(request:Request,context:{params:Promise<{id:string}>}){const {id}=await context.params; if(!await getProduct(id))return NextResponse.json({error:"商品不存在"},{status:404}); const body=await request.json().catch(()=>({})); const type=body.type as TaskType; if(!["RESEARCH","LISTING_GENERATION","ASSET_GENERATION","SEO_AUDIT"].includes(type))return NextResponse.json({error:"不支持的任务类型"},{status:400}); const task=await createTask(id,type,body.input,getRepositories()); await taskQueue.enqueue(task.id); return NextResponse.json({taskId:task.id,status:task.status,task},{status:202});}
