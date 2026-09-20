import type { TaskQueue } from "./types";
import { runTask } from "@/task-worker/runner";
import { getRepositories } from "@/repositories";
import { recoverPersistedTasks } from "@/task-recovery/service";
const pending=new Set<string>();
export class InProcessTaskQueue implements TaskQueue { async enqueue(taskId:string){if(pending.has(taskId))return; pending.add(taskId); setTimeout(()=>{void runTask(taskId).finally(()=>pending.delete(taskId));},0); } }
export const taskQueue:TaskQueue=new InProcessTaskQueue();
export const recoveryBootstrap=Promise.resolve().then(()=>recoverPersistedTasks(getRepositories(),taskQueue)).catch(()=>({scanned:0,queuedRecovered:0,staleRunningFound:0,interrupted:0}));
