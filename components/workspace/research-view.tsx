"use client";
import { useState } from "react";
import { ArrowRight, ExternalLink, ImageOff, RefreshCw, Search, ShieldCheck, Sparkles, Star, TriangleAlert } from "lucide-react";
import { dateLabel, isActiveTask, marketplaceLabel, money, compactNumber, researchKpis, safeSourceLink } from "@/lib/workspace-presentation";
import { Badge, CopyButton, EmptyState, Keywords, PageHeader, Section, TaskBadge, TaskBanner } from "./primitives";
import type { WorkspaceViewProps } from "./contracts";

function ProductImage({ url, title }: { url: string | null; title: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="ws-competitor-image">{url?.startsWith("https://") && !failed ?
    // External product images are rendered directly to preserve marketplace URLs.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={title} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : <ImageOff size={22} aria-label="暂无商品图片" />}</div>;
}

export function ResearchView({ product, research, tasks, runTask, navigate, notify, create }: WorkspaceViewProps) {
  const [tab, setTab] = useState("overview");
  const [submitting, setSubmitting] = useState(false);
  const task = tasks.find(item => item.type === "RESEARCH");
  const busy = submitting || tasks.some(item => item.type === "RESEARCH" && isActiveTask(item));
  const products = research?.competitorSnapshot ?? [];
  if (!product) return <EmptyState title="先创建一个商品项目" description="围绕一个商品，了解竞品、寻找机会，再创作 Listing。" action={<button className="ws-button" onClick={create}>创建商品<ArrowRight size={16} /></button>} />;
  const generate = async () => { setSubmitting(true); try { await runTask("RESEARCH"); } finally { setSubmitting(false); } };
  return <>
    <PageHeader eyebrow="市场智能 / 竞品研究" title={product.name} subtitle={<><span className="ws-market-logo">a</span><span>{marketplaceLabel(product.channel)}</span><span className="ws-divider-dot" /><span>{research ? `研究于 ${dateLabel(research.createdAt)}` : "尚未开始研究"}</span>{task ? <TaskBadge task={task} /> : <Badge>待研究</Badge>}</>} actions={<button className="ws-button ws-secondary" disabled={busy} onClick={() => void generate()}><RefreshCw size={15} className={busy ? "ws-spin" : ""} />{research ? "重新研究" : "开始竞品研究"}</button>} />
    <TaskBanner task={task} />
    {!research ? <EmptyState title={busy ? "正在为你收集市场信息" : "让下一步决策，有据可依"} description={busy ? "研究完成后，竞品、市场概览与 AI 洞察会显示在这里。" : "搜索 Amazon 商品，并基于保存的竞品数据分析卖点、痛点和差异化机会。"} action={!busy && <button className="ws-button" onClick={() => void generate()}><Search size={16} />开始竞品研究</button>} /> : <>
      <div className="ws-tabs" role="tablist" aria-label="研究内容">{[["overview", "研究概览"], ["competitors", `竞品商品 (${products.length})`], ["insights", "AI 市场洞察"]].map(([id, label]) => <button role="tab" aria-selected={tab === id} key={id} onClick={() => setTab(id)}>{label}</button>)}<span className="ws-tabs-meta"><ShieldCheck size={14} />保存的研究快照</span></div>
      {tab !== "insights" && <>
        <Section title="市场概览" label={<Badge tone="blue">{research.source === "mock" ? "示例数据" : "Amazon 数据"}</Badge>} action={<span className="ws-muted">采集于 {dateLabel(research.fetchedAt)}</span>}>
          <div className="ws-kpis">{researchKpis(research).map(item => <article className="ws-kpi" key={item.label}><span>{item.label}</span><strong title={item.value}>{item.value}</strong><small>{item.hint}</small></article>)}</div>
        </Section>
        <Section title="本次研究的竞品" label={`${products.length} 个商品 · 商品信息采集于研究时刻`} action={<Badge tone="blue">{marketplaceLabel(product.channel)}</Badge>}>
          {!products.length ? <EmptyState title="这份历史研究没有保存竞品快照" description="重新研究后可以查看商品图片、价格和 Amazon 来源链接。" /> : <div className="ws-table-scroll"><table className="ws-table ws-competitors"><thead><tr><th>商品信息</th><th>价格</th><th>评分 / 评论</th><th>数据状态</th><th>来源</th></tr></thead><tbody>{products.map((item, index) => {
            const href = safeSourceLink(item.productUrl);
            return <tr key={`${item.externalId}-${index}`}><td><div className="ws-competitor-product"><span className="ws-rank">{String(index + 1).padStart(2, "0")}</span><ProductImage url={item.imageUrl} title={item.title} /><div className="ws-product-copy"><strong title={item.title}>{item.title || "商品标题暂缺"}</strong><span>{item.brand || "品牌暂缺"}<span className="ws-dot">·</span>ASIN {item.externalId}</span><div className="ws-row-badges"><Badge tone={item.sponsored ? "amber" : "neutral"}>{item.sponsored ? "广告商品" : "自然结果"}</Badge><span>{marketplaceLabel(item.marketplace)}</span></div></div></div></td><td><b className="ws-price">{money(item.price, item.currency)}</b><small>{item.currency}</small></td><td><div className="ws-rating"><Star size={13} fill="currentColor" />{item.rating === null ? "暂无评分" : item.rating.toFixed(2)}</div><small>{compactNumber(item.reviewCount)} 条评论</small></td><td><Badge tone={item.enrichmentStatus === "succeeded" ? "green" : item.enrichmentStatus === "failed" ? "amber" : "neutral"}>{({ succeeded: "详情已补全", failed: "仅搜索数据", not_requested: "搜索数据", unknown: "详情未确认" })[item.enrichmentStatus]}</Badge></td><td>{href ? <a className="ws-source-link" href={href} target="_blank" rel="noopener noreferrer">查看 Amazon<ExternalLink size={13} /></a> : <span className="ws-muted">链接暂缺</span>}</td></tr>;
          })}</tbody></table></div>}
          <p className="ws-footnote">价格、库存与评价可能变化，以 Amazon 商品页为准。详情获取失败的商品保留搜索数据，并明确标记。</p>
        </Section>
      </>}
      {tab !== "competitors" && <>
        <Section title="AI 市场洞察" label={<Badge tone="green"><Sparkles size={12} />AI 分析</Badge>} action={<span className="ws-muted">{research.aiUsage?.model ?? "基于本次研究样本"}</span>}>
          <div className="ws-insight-grid"><article className="ws-insight"><div className="ws-insight-heading"><span className="ws-insight-icon green"><ShieldCheck size={18} /></span><h3>核心卖点</h3></div><ul>{research.coreSellingPoints.map((value, i) => <li key={i}>{value}</li>)}</ul></article><article className="ws-insight"><div className="ws-insight-heading"><span className="ws-insight-icon amber"><TriangleAlert size={18} /></span><h3>用户痛点</h3></div><ul>{research.userPainPoints.map((value, i) => <li key={i}>{value}</li>)}</ul><small className="ws-muted">基于商品信息的推断，需用用户反馈验证。</small></article></div>
          <div className="ws-audience"><h3>目标用户</h3><div className="ws-chips">{research.targetUsers.map(value => <span className="ws-audience-chip" key={value}>{value}</span>)}</div></div>
          <h3 className="ws-subheading">差异化机会</h3><div className="ws-opportunities">{research.competitorDifferentiators.map((value, i) => <article key={i}><span>{String(i + 1).padStart(2, "0")}</span><p>{value}</p><Badge tone="green">AI 建议</Badge></article>)}</div>
          {!!research.risks.length && <div className="ws-warning"><TriangleAlert size={19} /><div><h3>风险与不确定性</h3><ul>{research.risks.map((value, i) => <li key={i}>{value}</li>)}</ul></div></div>}
        </Section>
        <Section title="推荐关键词" label="AI 建议 · 点击关键词即可复制" action={<CopyButton value={research.recommendedKeywords.join(", ")} label="复制全部关键词" notify={notify} />}><Keywords values={research.recommendedKeywords} notify={notify} /></Section>
      </>}
      <div className="ws-next-step"><div><span className="ws-eyebrow">下一步 · 内容创作</span><h2>把市场洞察，变成商品文案</h2><p>Listing 将使用以上竞品数据、用户痛点和关键词生成。</p></div><button className="ws-button" onClick={() => navigate("listing")}>根据这份研究生成 Listing<ArrowRight size={16} /></button></div>
    </>}
  </>;
}
