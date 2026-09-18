import type { Product, Task } from "./types";

export const activeProduct: Product = { id: "p-001", name: "便携式净水滤芯水壶", subtitle: "Portable Water Filter Pitcher", market: "健康饮水", channel: "Amazon US", status: "进行中", progress: 54, updatedAt: "12 分钟前" };
export const products: Product[] = [
  activeProduct,
  { id: "p-002", name: "可折叠旅行收纳箱", subtitle: "Shopify · 家居收纳", market: "家居收纳", channel: "Shopify", status: "待开始", progress: 12, updatedAt: "昨天" },
  { id: "p-003", name: "宠物智能饮水机", subtitle: "TikTok Shop · 宠物用品", market: "宠物用品", channel: "TikTok Shop", status: "已发布", progress: 100, updatedAt: "9 月 12 日" },
];
export const tasks: Task[] = [
  { id: "t-1", title: "竞品研究 · 便携式净水滤芯水壶", detail: "分析 24 个竞品 · 已完成", status: "succeeded", time: "今天 09:24" },
  { id: "t-2", title: "生成 Listing · 版本 3", detail: "标题、五点和关键词 · 等待确认", status: "running", time: "今天 09:37" },
  { id: "t-3", title: "生成商品素材 · 4 张", detail: "主图和场景图 · 已完成", status: "succeeded", time: "今天 09:42" },
  { id: "t-4", title: "SEO 审计 · pureflow-store.demo", detail: "等待运行", status: "queued", time: "昨天 17:12" },
];
