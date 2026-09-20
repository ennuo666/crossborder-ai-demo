import { NextResponse } from "next/server";
import { getRepositories } from "@/repositories";
export async function GET(_request:Request,context:{params:Promise<{id:string}>}){const {id}=await context.params; const task=await getRepositories().tasks.findById(id); return task?NextResponse.json({task}):NextResponse.json({error:"任务不存在"},{status:404});}
