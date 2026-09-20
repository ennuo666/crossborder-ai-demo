import type { ResearchResultRecord, TaskRecord } from "./types";

export const channelLabels: Record<string, string> = { amazon: "Amazon US", "amazon.com": "Amazon US", "Amazon US": "Amazon US" };
export const marketplaceLabel = (value?: string) => value ? channelLabels[value] ?? value : "Amazon US";
export const dateLabel = (value?: string | null) => value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)) : "尚未更新";
export function money(value: unknown, currency = "USD") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "暂无价格";
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value); }
  catch { return `${value.toFixed(2)} ${currency}`; }
}
export function compactNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value) : "暂无数据";
}
export function safeSourceLink(value?: string | null) {
  try { const url = new URL(value ?? ""); return url.protocol === "https:" && /^([a-z0-9-]+\.)*amazon\.(com|co\.uk|de|fr|it|es|ca|co\.jp|com\.au)$/.test(url.hostname) ? url.href : null; } catch { return null; }
}
export function researchKpis(research: ResearchResultRecord) {
  const stats = research.stats;
  const snapshot = research.competitorSnapshot ?? [];
  const currencies = [...new Set(snapshot.filter(product => product.price !== null).map(product => product.currency))];
  const prices = snapshot.flatMap(product => product.price === null ? [] : [product.price]);
  const currency = currencies[0] ?? "USD";
  const range = prices.length && currencies.length === 1 ? `${money(Math.min(...prices), currency)} – ${money(Math.max(...prices), currency)}` : research.priceRange === "unknown" ? "暂无数据" : research.priceRange;
  const hasCoverage = typeof stats.enrichmentAttemptCount === "number" && typeof stats.enrichmentSuccessCount === "number";
  return [
    { label: "竞品数量", value: String(research.competitorCount), hint: "本次研究样本" },
    { label: "价格区间", value: currencies.length > 1 ? "多币种" : range, hint: "样本最低价至最高价" },
    { label: "中位价格", value: currencies.length > 1 ? "多币种" : money(stats.medianPrice, currency), hint: "已获取价格的样本" },
    { label: "平均评分", value: typeof stats.averageRating === "number" ? stats.averageRating.toFixed(2) : "暂无数据", hint: "满分 5.00" },
    { label: "平均评论数", value: compactNumber(stats.averageReviewCount), hint: "每个商品的评论数量" },
    { label: "详情数据覆盖", value: hasCoverage ? `${stats.enrichmentSuccessCount} / ${stats.enrichmentAttemptCount}` : "暂无数据", hint: "成功获取 / 请求商品" },
  ];
}
export const taskTypeLabel: Record<TaskRecord["type"], string> = { RESEARCH: "竞品研究", LISTING_GENERATION: "Listing 生成", ASSET_GENERATION: "素材生成", SEO_AUDIT: "SEO 审计" };
export const taskStatusLabel: Record<TaskRecord["status"], string> = { queued: "等待执行", running: "处理中", succeeded: "已完成", failed: "执行失败", cancelled: "已取消" };
export const isActiveTask = (task: TaskRecord) => task.status === "queued" || task.status === "running";
export function taskErrorLabel(task: TaskRecord) {
  if (task.errorCode === "TASK_INTERRUPTED") return "任务因服务中断而停止，请重新发起。";
  if (task.errorMessage?.includes("RESEARCH_REQUIRED")) return "请先完成一次竞品研究，再生成 Listing。";
  if (task.errorMessage?.includes("401") || task.errorMessage?.includes("AUTH")) return "服务暂时无法通过认证，请联系管理员。";
  if (task.errorMessage?.includes("SCHEMA") || task.errorMessage?.includes("JSON")) return "AI 返回的内容未通过校验，请重新生成。";
  return "本次任务未能完成，已保存错误记录。请稍后重试。";
}
