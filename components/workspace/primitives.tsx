"use client";
import { AlertCircle, ArrowRight, Check, Copy, Inbox, Loader2, X } from "lucide-react";
import type { ReactNode } from "react";
import type { TaskRecord } from "@/lib/types";
import { taskErrorLabel, taskStatusLabel, taskTypeLabel } from "@/lib/workspace-presentation";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "blue" | "amber" | "red" }) { return <span className={`ws-badge ws-${tone}`}>{children}</span>; }
export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow: string; title: string; subtitle?: ReactNode; actions?: ReactNode }) { return <header className="ws-page-header"><div><p className="ws-eyebrow">{eyebrow}</p><h1>{title}</h1><div className="ws-header-meta">{subtitle}</div></div><div className="ws-actions">{actions}</div></header>; }
export function Section({ title, label, action, children, className = "" }: { title: string; label?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) { return <section className={`ws-section ${className}`}><div className="ws-section-heading"><div><h2>{title}</h2>{label && <span className="ws-muted">{label}</span>}</div>{action}</div>{children}</section>; }
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="ws-empty"><span className="ws-empty-icon"><Inbox size={25} /></span><h2>{title}</h2><p>{description}</p>{action}</div>; }
export function Skeleton() { return <div className="ws-skeleton" aria-label="正在加载" role="status"><div className="ws-skeleton-heading" /><div className="ws-kpis">{Array.from({ length: 6 }, (_, index) => <div key={index} />)}</div>{Array.from({ length: 5 }, (_, index) => <div className="ws-skeleton-row" key={index} />)}</div>; }
export function ErrorState({ message, retry }: { message: string; retry: () => void }) { return <div className="ws-error" role="alert"><AlertCircle size={20} /><div><strong>暂时无法加载</strong><p>{message}</p></div><button className="ws-button ws-secondary" onClick={retry}>重试</button></div>; }
export function TaskBadge({ task }: { task: TaskRecord }) { return <Badge tone={task.status === "failed" ? "red" : task.status === "succeeded" ? "green" : "blue"}>{task.status === "running" && <Loader2 size={12} className="ws-spin" />}{taskStatusLabel[task.status]}</Badge>; }
export function TaskBanner({ task }: { task?: TaskRecord }) {
  if (!task || task.status === "succeeded" || task.status === "cancelled") return null;
  if (task.status === "failed") return <div className="ws-error" role="alert"><AlertCircle size={20} /><div><strong>{taskTypeLabel[task.type]}未完成</strong><p>{taskErrorLabel(task)}</p></div></div>;
  return <div className="ws-task-banner" role="status"><Loader2 className="ws-spin" size={23} /><div><strong>{task.status === "queued" ? "任务已排队，等待执行" : `${taskTypeLabel[task.type]}进行中`}</strong><p>{task.type === "RESEARCH" ? "搜索 Amazon 竞品 → 获取商品详情 → 分析市场机会" : "读取研究依据 → 生成英文文案与中文对照 → 保存新版本"}</p><small>完成后自动更新，可离开页面稍后查看。</small></div></div>;
}
export function CopyButton({ value, label = "复制", notify }: { value: string; label?: string; notify: (message: string) => void }) {
  return <button className="ws-icon-button" type="button" aria-label={label} title={label} disabled={!value} onClick={() => void navigator.clipboard.writeText(value).then(() => notify("已复制到剪贴板"), () => notify("复制失败，请检查浏览器权限"))}><Copy size={15} /></button>;
}
export function Keywords({ values, notify, remove }: { values: string[]; notify: (message: string) => void; remove?: (index: number) => void }) { return <div className="ws-chips">{values.map((value, index) => <span className="ws-chip" key={`${index}-${value}`}><button title="复制关键词" onClick={() => void navigator.clipboard.writeText(value).then(() => notify("关键词已复制"), () => notify("复制失败"))}>{value}</button>{remove && <button aria-label={`删除 ${value}`} title="删除关键词" onClick={() => remove(index)}><X size={12} /></button>}</span>)}</div>; }
export function StepLink({ children, onClick }: { children: ReactNode; onClick: () => void }) { return <button className="ws-text-button" onClick={onClick}>{children}<ArrowRight size={15} /></button>; }
export function SavedMark() { return <span className="ws-saved"><Check size={14} />已保存</span>; }
