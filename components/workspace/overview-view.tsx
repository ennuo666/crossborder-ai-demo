"use client";
import { ArrowRight, FileText, Package, Plus, Search } from "lucide-react";
import { dateLabel, isActiveTask, marketplaceLabel, taskTypeLabel } from "@/lib/workspace-presentation";
import { Badge, EmptyState, PageHeader, Section, TaskBadge } from "./primitives";
import type { WorkspaceViewProps } from "./contracts";

export function ProductTable({ products, summaries, openProduct }: Pick<WorkspaceViewProps, "products" | "summaries" | "openProduct">) {
  return <div className="ws-table-scroll"><table className="ws-table ws-products"><thead><tr><th>商品项目</th><th>竞品研究</th><th>竞品数量</th><th>Listing</th><th>最近更新</th><th>下一步</th></tr></thead><tbody>{products.map(product => {
    const summary = summaries.find(item => item.productId === product.id);
    const task = summary?.tasks.find(item => item.type === "RESEARCH" && isActiveTask(item));
    const date = [product.updatedAt, summary?.research?.createdAt, summary?.latestListing?.createdAt].filter((value): value is string => !!value).sort().at(-1);
    return <tr key={product.id}><td><div className="ws-product-name"><span className="ws-product-symbol"><Package size={19} /></span><div><button onClick={() => openProduct(product.id, "research")}>{product.name}</button><small>{marketplaceLabel(product.channel)}</small></div></div></td><td>{task ? <TaskBadge task={task} /> : <Badge tone={summary?.research ? "green" : "neutral"}>{summary?.research ? "已完成研究" : "待研究"}</Badge>}</td><td>{summary?.research?.competitorCount ?? "—"}</td><td>{summary?.listingCount ? <Badge tone="blue">{summary.listingCount} 个版本</Badge> : <span className="ws-muted">未生成</span>}</td><td className="ws-muted">{dateLabel(date)}</td><td><div className="ws-row-actions"><button title="查看研究" aria-label={`查看 ${product.name} 的研究`} onClick={() => openProduct(product.id, "research")}><Search size={15} />研究</button><button title="编辑 Listing" aria-label={`编辑 ${product.name} 的 Listing`} onClick={() => openProduct(product.id, "listing")}><FileText size={15} />Listing</button></div></td></tr>;
  })}</tbody></table></div>;
}

export function RecentTasks({ tasks, products, openProduct }: { tasks: WorkspaceViewProps["recentTasks"]; products: WorkspaceViewProps["products"]; openProduct: WorkspaceViewProps["openProduct"] }) {
  return <div className="ws-task-list">{tasks.map(task => <div className="ws-task-row" key={task.id}><span className="ws-task-type-icon">{task.type === "RESEARCH" ? <Search size={18} /> : <FileText size={18} />}</span><div><strong>{taskTypeLabel[task.type]}</strong><button onClick={() => openProduct(task.productId, task.type === "RESEARCH" ? "research" : "listing")}>{products.find(item => item.id === task.productId)?.name ?? "商品项目"}</button></div><span className="ws-muted">{dateLabel(task.createdAt)}</span><TaskBadge task={task} /></div>)}</div>;
}

export function OverviewView(props: WorkspaceViewProps) {
  const { user, products, summaries, recentTasks, create, navigate } = props;
  const active = summaries.reduce((count, summary) => count + summary.tasks.filter(isActiveTask).length, 0);
  const metrics = [["商品项目", products.length, "管理你的商品方向"], ["已完成研究", summaries.filter(item => item.research).length, "有市场依据的商品"], ["Listing 版本", summaries.reduce((sum, item) => sum + item.listingCount, 0), "已保存的内容版本"], ["正在执行", active, "后台任务持续处理"]];
  return <><PageHeader eyebrow="工作台 / 总览" title={`${user.name}，欢迎回来`} subtitle="从市场证据出发，推进你的下一款商品。" actions={<button className="ws-button" onClick={create}><Plus size={16} />创建商品</button>} /><div className="ws-kpis ws-four-kpis">{metrics.map(([label, value, hint]) => <article className="ws-kpi" key={label}><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>)}</div>
    <Section title="最近商品" label={`${products.length} 个商品项目`} action={<button className="ws-text-button" onClick={() => navigate("products")}>全部商品<ArrowRight size={15} /></button>}>{products.length ? <ProductTable {...props} products={products.slice(0, 6)} /> : <EmptyState title="你的第一个商品，从这里开始" description="创建商品后，先研究 Amazon 竞品，再生成中英文 Listing。" action={<button className="ws-button" onClick={create}><Plus size={15} />创建商品项目</button>} />}</Section>
    <Section title="最近任务" label="研究与内容生成的最新动态" action={<button className="ws-text-button" onClick={() => navigate("tasks")}>全部任务<ArrowRight size={15} /></button>}>{recentTasks.length ? <RecentTasks tasks={recentTasks.slice(0, 5)} products={products} openProduct={props.openProduct} /> : <div className="ws-inline-empty"><Search size={20} /><span>还没有任务。打开一个商品，即可开始竞品研究。</span></div>}</Section>
  </>;
}
