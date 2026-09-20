"use client";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, ChevronDown, FileText, History, Plus, Save, Sparkles } from "lucide-react";
import type { ListingRecord } from "@/lib/types";
import { dateLabel, isActiveTask, marketplaceLabel } from "@/lib/workspace-presentation";
import { listingPolicy } from "@/lib/listing-policy";
import { Badge, CopyButton, EmptyState, Keywords, PageHeader, SavedMark, Section, TaskBanner } from "./primitives";
import type { WorkspaceViewProps } from "./contracts";

type Draft = { title: string; titleZh: string; bullets: string[]; bulletsZh: string[]; description: string; descriptionZh: string; keywords: string[] };
const draftOf = (listing?: ListingRecord): Draft => ({ title: listing?.title ?? "", titleZh: listing?.titleZh ?? "", bullets: listing?.bullets ?? [], bulletsZh: listing?.bulletsZh ?? [], description: listing?.description ?? "", descriptionZh: listing?.descriptionZh ?? "", keywords: listing?.keywords ?? [] });

function BilingualField({ label, english, chinese, onEnglish, onChinese, limit, notify, large = false }: { label: string; english: string; chinese: string; onEnglish: (value: string) => void; onChinese: (value: string) => void; limit?: number; notify: (message: string) => void; large?: boolean }) {
  return <div className={`ws-bilingual-field ${large ? "ws-long-field" : ""}`}><div className="ws-field-heading"><h3>{label}</h3><span className={limit && english.length > limit ? "ws-over-limit" : "ws-muted"}>{english.length}{limit ? ` / ${limit}` : ""} 字符</span><CopyButton value={english} label={`复制${label}英文`} notify={notify} /></div><div className="ws-bilingual-grid"><label className="ws-translation"><span>中文参考</span><textarea aria-label={`${label}中文参考`} value={chinese} onChange={event => onChinese(event.target.value)} placeholder="此版本暂无中文对照" rows={large ? 8 : 3} /></label><label className="ws-english"><span>Amazon English <Badge tone="blue">正式文案</Badge></span><textarea aria-label={`${label}英文`} lang="en" value={english} onChange={event => onEnglish(event.target.value)} rows={large ? 8 : 3} /></label></div></div>;
}

export function ListingView(props: WorkspaceViewProps) {
  const { product, research, listings, tasks, navigate, notify, runTask, refresh, dirty, setDirty, create } = props;
  const [selectedId, setSelectedId] = useState("");
  const selected = listings.find(item => item.id === selectedId) ?? listings[0];
  const [draft, setDraft] = useState<Draft>(draftOf(selected));
  const [keyword, setKeyword] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [latestSeen, setLatestSeen] = useState(listings[0]?.id);
  const [saveError, setSaveError] = useState("");
  const task = tasks.find(item => item.type === "LISTING_GENERATION");
  const busy = generating || tasks.some(item => item.type === "LISTING_GENERATION" && isActiveTask(item));
  useEffect(() => { if (!dirty) setDraft(draftOf(selected)); }, [selected, dirty]);
  useEffect(() => {
    if (listings[0]?.id !== latestSeen && !dirty) { setSelectedId(listings[0]?.id ?? ""); setLatestSeen(listings[0]?.id); }
  }, [listings, latestSeen, dirty]);
  const edit = <K extends keyof Draft>(key: K, value: Draft[K]) => { setDraft(current => ({ ...current, [key]: value })); setDirty(true); setSaveError(""); };
  const bullet = (index: number, value: string, zh = false) => { const key = zh ? "bulletsZh" : "bullets"; const next = [...draft[key]]; next[index] = value; edit(key, next); };
  const confirmDiscard = () => !dirty || window.confirm("当前修改尚未保存。要放弃修改吗？");
  const generate = async () => { if (!confirmDiscard()) return; setDirty(false); setGenerating(true); try { await runTask("LISTING_GENERATION"); } finally { setGenerating(false); } };
  async function save() {
    if (!product || !selected) return;
    setSaving(true); setSaveError("");
    try {
      const response = await fetch(`/api/products/${product.id}/listing`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...draft, sourceListingId: selected.id }) });
      if (!response.ok) throw new Error("保存失败，请检查中英文内容是否完整，并确认字符长度。");
      const data = await response.json() as { listing: ListingRecord };
      setDirty(false); setSelectedId(data.listing.id); setLatestSeen(data.listing.id); await refresh(); notify("已保存为新版本，历史版本保持不变");
    } catch (error) { setSaveError(error instanceof Error ? error.message : "保存失败，请重试"); }
    finally { setSaving(false); }
  }
  if (!product) return <EmptyState title="开始你的第一个商品项目" description="完成研究后，即可生成英文 Listing 与中文对照。" action={<button className="ws-button" onClick={create}>创建商品<ArrowRight size={16} /></button>} />;
  const context = selected?.researchContext;
  return <>
    <PageHeader eyebrow="内容工作台 / Listing" title={product.name} subtitle={<><span className="ws-market-logo">a</span>{marketplaceLabel(product.channel)}<span className="ws-divider-dot" /><span>英文文案 · 中文对照</span></>} actions={<><button className="ws-button ws-secondary" disabled={busy || !research} onClick={() => void generate()}><Sparkles size={15} />{busy ? "正在生成" : "生成新版本"}</button>{selected && <button className="ws-button" disabled={saving || !dirty || busy} onClick={() => void save()}><Save size={15} />{saving ? "正在保存" : "保存版本"}</button>}</>} />
    <TaskBanner task={task} />
    {!selected ? <EmptyState title={busy ? "正在撰写中英文 Listing" : "从研究洞察，到清晰的商品表达"} description={research ? "英文标题、五点描述和详情文案，附中文参考。每次生成都会保留为独立版本。" : "先完成竞品研究，让文案基于真实商品数据和市场机会。"} action={research ? <button className="ws-button" disabled={busy} onClick={() => void generate()}><Sparkles size={16} />根据研究生成 Listing</button> : <button className="ws-button" onClick={() => navigate("research")}>前往竞品研究<ArrowRight size={16} /></button>} /> : <>
      <div className="ws-version-bar"><History size={17} /><label>版本<select aria-label="Listing 版本" value={selected.id} onChange={event => { if (confirmDiscard()) { setDirty(false); setSelectedId(event.target.value); } }}>{listings.map((item, index) => <option value={item.id} key={item.id}>Version {item.version}{index === 0 ? " · 当前版本" : ""} · {dateLabel(item.createdAt)}</option>)}</select></label><Badge tone={selected.id === listings[0]?.id ? "green" : "neutral"}>{selected.id === listings[0]?.id ? "当前版本" : "历史版本"}</Badge><span className="ws-muted">{selected.aiUsage?.model ?? "手动保存"} · {dateLabel(selected.createdAt)}</span><span className="ws-version-status">{dirty ? <Badge tone="amber">未保存修改</Badge> : <SavedMark />}</span></div>
      <details className="ws-research-context"><summary><BookOpen size={16} /><strong>本 Listing 基于</strong><span>{context ? `${context.competitorCount} 个 ${marketplaceLabel(context.marketplace)} 竞品 · ${context.priceRange}` : "历史版本未记录研究关联"}</span><ChevronDown size={15} /></summary>{context ? <div><dl><div><dt>研究时间</dt><dd>{dateLabel(context.createdAt)}</dd></div><div><dt>关键词数量</dt><dd>{context.recommendedKeywords.length}</dd></div><div><dt>主要痛点</dt><dd>{context.userPainPoints.join("；")}</dd></div></dl><button className="ws-text-button" onClick={() => navigate("research")}>查看竞品研究<ArrowRight size={14} /></button>{research?.id !== context.researchId && <p className="ws-muted">此版本使用较早的研究；研究页展示最近一次结果。</p>}</div> : <p>重新生成的版本将保存研究依据。</p>}</details>
      {saveError && <div className="ws-error" role="alert">{saveError}</div>}
      <Section title="商品标题" label="中文用于理解与审核，英文用于 Amazon Listing。"><BilingualField label="标题" english={draft.title} chinese={draft.titleZh} onEnglish={value => edit("title", value)} onChinese={value => edit("titleZh", value)} limit={listingPolicy.titleMaxLength} notify={notify} /></Section>
      <Section title="五点描述" label={`${draft.bullets.length} 条卖点 · 每条独立编辑`} action={<CopyButton value={draft.bullets.join("\n\n")} label="复制全部英文五点描述" notify={notify} />}><div className="ws-bullets">{draft.bullets.map((value, index) => <BilingualField key={index} label={`卖点 ${index + 1}`} english={value} chinese={draft.bulletsZh[index] ?? ""} onEnglish={text => bullet(index, text)} onChinese={text => bullet(index, text, true)} limit={listingPolicy.bulletMaxLength} notify={notify} />)}</div></Section>
      <Section title="商品描述" label="完整介绍商品与适用场景"><BilingualField label="描述" english={draft.description} chinese={draft.descriptionZh} onEnglish={value => edit("description", value)} onChinese={value => edit("descriptionZh", value)} limit={listingPolicy.descriptionMaxLength} notify={notify} large /></Section>
      <Section title="搜索关键词" label={`${draft.keywords.length} 个关键词`} action={<CopyButton value={draft.keywords.join(", ")} label="复制全部关键词" notify={notify} />}><Keywords values={draft.keywords} notify={notify} remove={index => edit("keywords", draft.keywords.filter((_, i) => i !== index))} /><form className="ws-add-keyword" onSubmit={event => { event.preventDefault(); const value = keyword.trim(); if (value && !draft.keywords.includes(value)) edit("keywords", [...draft.keywords, value]); setKeyword(""); }}><input aria-label="添加关键词" placeholder="输入英文关键词" maxLength={100} value={keyword} onChange={event => setKeyword(event.target.value)} /><button className="ws-button ws-secondary" type="submit" disabled={!keyword.trim()}><Plus size={15} />添加</button></form></Section>
      <div className="ws-editor-footer"><span><FileText size={15} />保存会创建新版本，不覆盖当前内容。中英文修改请一并审核。</span><button className="ws-button" disabled={!dirty || saving || busy} onClick={() => void save()}><Save size={15} />保存版本</button></div>
    </>}
  </>;
}
