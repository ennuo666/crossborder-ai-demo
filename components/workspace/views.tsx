"use client";
import { Badge, EmptyState, PageHeader } from "./primitives";
import { RecentTasks } from "./overview-view";
import type { WorkspaceViewProps } from "./contracts";
export { OverviewView } from "./overview-view";
export { ProductsView } from "./products-view";
export { ResearchView } from "./research-view";
export { ListingView } from "./listing-view";
export function TasksView(props: WorkspaceViewProps) { return <><PageHeader eyebrow="工作台 / 任务" title="任务记录" subtitle="所有商品的研究与内容生成动态。" />{props.recentTasks.length ? <RecentTasks tasks={props.recentTasks} products={props.products} openProduct={props.openProduct} /> : <EmptyState title="暂无任务" description="在商品项目中开始一次竞品研究。" />}</>; }
export function ComingSoonView({ name }: { name: string }) { return <><PageHeader eyebrow="后续能力" title={name} subtitle={<Badge>即将推出</Badge>} /><EmptyState title={`${name}尚未开放`} description="当前 Beta 支持 Amazon 竞品研究与中英文 Listing 创作。" /></>; }
export function SettingsView({ user }: WorkspaceViewProps) { return <><PageHeader eyebrow="个人工作区" title="账户信息" subtitle="当前登录账户" /><dl className="ws-account"><div><dt>姓名</dt><dd>{user.name}</dd></div><div><dt>邮箱</dt><dd>{user.email}</dd></div><div><dt>工作区</dt><dd>个人工作区<Badge>Beta</Badge></dd></div></dl></>; }
