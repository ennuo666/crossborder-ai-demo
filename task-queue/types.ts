export interface TaskQueue { enqueue(taskId:string): Promise<void>; }
