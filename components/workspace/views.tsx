"use client";

import { useEffect, useState } from "react";
import type { AssetRecord, SeoAuditRecord, ListingRecord, ProductRecord, ResearchResultRecord, TaskRecord, TaskType, ViewKey } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
type ViewProps = { assets?: AssetRecord[]; seoAudit?: SeoAuditRecord | null; user?: { name: string; email: string }; navigate: (view: ViewKey) => void; toast: (message: string) => void; product?: ProductRecord | null; products?: ProductRecord[]; tasks?: TaskRecord[]; listing?: ListingRecord | null; research?: ResearchResultRecord | null; productId?: string; runTask?: (type: TaskType) => Promise<void>; refresh?: () => Promise<void>; selectProduct?: (id: string) => Promise<void> };



function Heading({ eyebrow, title, description, action }: { eyebrow: string; title: React.ReactNode; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="subheading">{description}</p></div>{action}</div>;
}


export function OverviewView({ navigate, toast, product, products = [], tasks = [], research, listing, user }: ViewProps) {
  return <section className="page-view active"><Heading eyebrow="工作台" title={`你好，${user?.name ?? ""}`} description={product?.name ?? ""} action={<Button onClick={() => toast("打开创建商品流程")}>＋ 创建商品</Button>} />
    <div className="kpi-grid">{[["商品项目", products.length], ["当前商品任务", tasks.length], ["竞品样本", research?.competitorCount ?? 0], ["Listing 版本", listing?.version ?? 0]].map(([label, value]) => <Card className="kpi-card" key={label}><div><span>{label}</span><strong>{value}</strong></div></Card>)}</div>
    <div className="section-title"><h2>{product?.name}</h2><button className="text-btn" onClick={() => navigate("products")}>查看全部商品 →</button></div>
    <div className="research-grid"><section><h3>市场机会</h3><p>{research?.priceRange ?? "等待竞品研究"}</p>{research?.opportunities.map(value => <p key={value}>{value}</p>)}<Button onClick={() => navigate("research")}>竞品研究</Button></section><section><h3>Listing</h3><p>{listing?.title ?? "尚未生成"}</p><Button onClick={() => navigate("listing")}>Listing 文案</Button></section></div>
  </section>;
}

export function ProductsView({ navigate, toast, products: productRows = [], selectProduct }: ViewProps) { return <section className="page-view active"><Heading eyebrow="商品中心" title="我的商品" description="所有商品项目都在这里继续推进。" action={<Button onClick={() => toast("打开创建商品流程")}>＋ 创建商品</Button>} /><div className="filter-row"><div className="search-field">⌕ <input placeholder="搜索商品名称" /></div><button className="filter-btn">全部状态⌄</button><button className="filter-btn">全部渠道⌄</button></div><div className="product-table"><div className="table-head"><span>商品</span><span>当前阶段</span><span>完成度</span><span>更新时间</span><span /></div>{productRows.map(product => <div className="table-row" key={product.id}><div className="table-product"><div className="tiny-product">▥</div><div><b>{product.name}</b><small>{product.channel} · {product.market}</small></div></div><span className={`status-pill ${product.status === "已发布" ? "done" : product.status === "待开始" ? "ready" : "in-progress"}`}>{product.status === "进行中" ? "生成素材" : product.status}</span><div className="table-progress"><span><i style={{ width: `${product.progress}%` }} /></span><b>{product.progress}%</b></div><span className="muted">{product.updatedAt}</span><button className="row-action" onClick={() => { void selectProduct?.(product.id); navigate("overview"); }}>打开 →</button></div>)}</div></section>; }

export function ResearchView({ navigate, runTask, research, product }: ViewProps) {
  const [running, setRunning] = useState(false);
  return <section className="page-view active"><Heading eyebrow={product?.name ?? ""} title="竞品研究" description={research?.marketplace ?? "尚未研究"} action={<Button disabled={running} onClick={() => { setRunning(true); void runTask?.("RESEARCH").finally(() => setRunning(false)); }}>{running ? "研究进行中…" : "开始竞品研究"}</Button>} />
    <div className="research-hero"><div><span>{research ? "研究已完成" : "等待研究"}</span><h2>{research?.coreSellingPoints[0] ?? product?.name}</h2><p>{research?.priceRange}</p></div><div className="research-number"><strong>{research?.competitorCount ?? 0}</strong><span>竞品样本</span></div></div>
    {research && <><div className="research-grid">{[["核心卖点", research.coreSellingPoints], ["用户痛点", research.userPainPoints], ["目标用户", research.targetUsers], ["差异化机会", research.competitorDifferentiators], ["关键词", research.recommendedKeywords], ["风险与不确定性", research.risks]].map(([label, values]) => <section key={String(label)}><h3>{label}</h3>{(values as string[]).map(value => <p key={value}>{value}</p>)}</section>)}</div><section><h3>研究统计</h3><p>{research.coverage} · {research.priceRange}</p><dl>{Object.entries(research.stats).filter(([, value]) => typeof value === "number" || typeof value === "string").map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>)}</dl></section><Button onClick={() => navigate("listing")}>根据研究生成 Listing →</Button></>}
  </section>;
}

export function ListingView({ toast, productId, product, listing, refresh, runTask }: ViewProps) {
  const [title, setTitle] = useState(listing?.title ?? "");
  const [generating, setGenerating] = useState(false);
  useEffect(() => { setTitle(listing?.title ?? ""); }, [listing, productId]);
  async function save() {
    if (!productId) return;
    const response = await fetch(`/api/products/${productId}/listing`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, bullets: listing?.bullets ?? [], description: listing?.description ?? "", keywords: listing?.keywords ?? [] }) });
    if (response.ok) { toast("Listing 版本已保存"); await refresh?.(); } else toast("保存失败");
  }
  return <section className="page-view active"><Heading eyebrow={product?.name ?? ""} title="Listing 文案" description="商品内容" action={<Button disabled={generating} onClick={() => { setGenerating(true); void runTask?.("LISTING_GENERATION").finally(() => setGenerating(false)); }}>{generating ? "生成中…" : "生成新版本"}</Button>} />
    <div className="editor-layout"><div className="editor-main"><div className="version-row">{listing ? `版本 ${listing.version}` : "尚未生成"}</div><label>商品标题<textarea value={title} onChange={event => setTitle(event.target.value)} /></label><label>五点描述<div className="bullet-editor">{listing?.bullets.map((bullet, index) => <p key={index}>{bullet}</p>)}</div></label><label>描述<p>{listing?.description}</p></label><label>关键词<div className="keyword-input">{listing?.keywords.map(keyword => <span key={keyword}>{keyword}</span>)}</div></label><Button onClick={() => void save()} disabled={!title.trim()}>保存版本</Button></div></div>
  </section>;
}

export function AssetsView({ assets = [], product }: ViewProps) {
  return <section className="page-view active"><Heading eyebrow={product?.name ?? ""} title="商品素材" description="已保存素材" /><div className="asset-grid">{assets.map(asset => <article className="asset-card" key={asset.id}><h3>{asset.name}</h3><p>{asset.kind} · {asset.status}</p></article>)}</div>{!assets.length && <p>暂无素材</p>}</section>;
}

export function StoreView({ product, listing }: ViewProps) {
  return <section className="page-view active"><Heading eyebrow={product?.name ?? ""} title="商品页预览" description="未发布" /><div className="store-preview-wrap"><section><h2>{listing?.title ?? product?.name}</h2><p>{listing?.description ?? "尚未生成商品内容"}</p>{listing?.bullets.map((bullet, index) => <p key={index}>{bullet}</p>)}</section></div></section>;
}

export function SeoView({ product, seoAudit }: ViewProps) {
  return <section className="page-view active"><Heading eyebrow={product?.name ?? ""} title="SEO 优化" description={seoAudit ? "已保存审计" : "尚未运行审计"} action={<Button disabled>运行审计</Button>} />{seoAudit && <div className="seo-overview"><h2>{seoAudit.score} / 100</h2><p>{seoAudit.issueCount} 项问题</p></div>}</section>;
}

export function TasksView({ tasks: taskRows = [] }: ViewProps) { return <section className="page-view active"><Heading eyebrow="工作台" title="任务记录" description="查看所有研究、生成和发布任务的状态。" action={<button className="filter-btn">最近 30 天⌄</button>} /><div className="task-list">{taskRows.map(task => <div className="task-row" key={task.id}><span className={`task-icon ${task.status === "succeeded" ? "green" : task.status === "running" ? "purple" : task.status === "queued" ? "orange" : "blue"}`}>{task.status === "succeeded" ? "✓" : task.status === "running" ? "✦" : task.status === "queued" ? "◌" : "▧"}</span><div><b>{task.type}</b><small>{task.status === "succeeded" ? "已完成" : task.status === "running" ? "执行中" : task.status === "queued" ? "等待执行" : task.status === "failed" ? `失败：${task.errorMessage ?? "任务异常"}` : "已取消"}</small></div><span className="task-time">{new Date(task.createdAt).toLocaleString("zh-CN")}</span><span className={`status-pill ${task.status === "succeeded" ? "done" : task.status === "running" ? "in-progress" : "ready"}`}>{task.status === "succeeded" ? "已完成" : task.status === "running" ? "执行中" : task.status === "failed" ? "失败" : task.status === "cancelled" ? "已取消" : "等待执行"}</span></div>)}</div></section>; }

export function SettingsView({ toast, user }: ViewProps) { return <section className="page-view active"><Heading eyebrow="工作台" title="设置" description="管理工作区、集成和用量。" /><div className="settings-grid"><div className="settings-nav"><button className="active">工作区设置</button><button>集成与 API</button><button>用量与账单</button><button>账户信息</button></div><div className="panel settings-panel"><h3>工作区设置</h3><label>工作区名称<input defaultValue={`${user?.name ?? ""} 的工作区`} /></label><label>默认市场<select defaultValue="us"><option value="us">美国 · Amazon US</option><option value="uk">英国 · Amazon UK</option></select></label><label>默认语言<select defaultValue="zh"><option value="zh">中文（简体）</option><option value="en">English</option></select></label><Button onClick={() => toast("设置已保存")}>保存设置</Button></div></div></section>; }


