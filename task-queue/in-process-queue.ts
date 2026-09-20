import type { TaskQueue } from "./types";
import { runTask } from "@/task-worker/runner";
import { getRepositories } from "@/repositories";
const pending=new Set<string>();
export class InProcessTaskQueue implements TaskQueue { async enqueue(taskId:string){if(pending.has(taskId))return; pending.add(taskId); setTimeout(()=>{void runTask(taskId).finally(()=>pending.delete(taskId));},0); } }
export const taskQueue:TaskQueue=new InProcessTaskQueue();
