export type ViewKey = "overview" | "products" | "research" | "listing" | "assets" | "store" | "seo" | "tasks" | "settings";

export type TaskStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  market: string;
  channel: string;
  status: string;
  progress: number;
  updatedAt: string;
};

export type Task = { id: string; title: string; detail: string; status: TaskStatus; time: string };
