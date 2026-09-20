import { getRepositories } from "@/repositories";
import { runResearchTask } from "@/services/research-service";
import { runListingTask } from "@/services/listing-service";
import type { RepositoryBundle } from "@/repositories/types";
export async function runTask(taskId:string,repositories:RepositoryBundle=getRepositories()){const task=await repositories.tasks.findById(taskId); if(!task||task.status!=="queued") return task; if(task.type==="RESEARCH") return runResearchTask(task.id,task.productId,undefined,repositories); if(task.type==="LISTING_GENERATION") return runListingTask(task.id,task.productId,repositories); return repositories.tasks.update(task.id,{status:"failed",progress:100,errorCode:"UNSUPPORTED_TASK_TYPE",errorMessage:"该任务类型暂未支持",finishedAt:new Date().toISOString()});}
