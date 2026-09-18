import { tasks } from "@/lib/mock-data";
import type { Task, TaskStatus } from "@/lib/types";

export function listTasks(): Task[] { return tasks; }
export function getDisplayStatus(status: TaskStatus) { return ({ queued: "待开始", running: "需确认", succeeded: "已完成", failed: "失败", cancelled: "已取消" })[status]; }
