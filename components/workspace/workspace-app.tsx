"use client";

import { useEffect, useState } from "react";
import type { ListingRecord, ProductRecord, ResearchResultRecord, TaskRecord, TaskType, ViewKey } from "@/lib/types";
import { navigationGroups, viewNames } from "@/lib/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { OverviewView, ProductsView, ResearchView, ListingView, AssetsView, StoreView, SeoView, TasksView, SettingsView } from "./views";

export function WorkspaceApp() {
  const [currentView, setCurrentView] = useState<ViewKey>("overview");
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [copilotInput, setCopilotInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [productRows, setProductRows] = useState<ProductRecord[]>([]);
  const [taskRows, setTaskRows] = useState<TaskRecord[]>([]);
  const [activeProduct, setActiveProduct] = useState<ProductRecord | null>(null);
  const [listing, setListing] = useState<ListingRecord | null>(null);
  const [research, setResearch] = useState<ResearchResultRecord | null>(null);

  function toast(message: string) { setToastMessage(message); window.setTimeout(() => setToastMessage(""), 2600); }
  function navigate(view: ViewKey) { setCurrentView(view); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function sendMessage(message: string) { const value = message.trim(); if (!value) return; setMessages(items => [...items, value, "我会基于当前商品上下文处理这件事。这个 Demo 先展示操作路径，接入真实模型后会在这里返回可编辑结果。"]); setCopilotInput(""); }

  async function loadWorkspace() {
    const response = await fetch("/api/products", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json() as { products: ProductRecord[] };
    setProductRows(data.products ?? []);
    const product = data.products?.[0];
    if (!product) { setActiveProduct(null); setTaskRows([]); setListing(null); setResearch(null); return; }
    setActiveProduct(product);
    const detailResponse = await fetch(`/api/products/${product.id}`, { cache: "no-store" });
    if (!detailResponse.ok) return;
    const detail = await detailResponse.json() as { tasks?: TaskRecord[]; listing?: ListingRecord | null; research?: ResearchResultRecord | null };
    setTaskRows(detail.tasks ?? []);
    setListing(detail.listing ?? null);
    setResearch(detail.research ?? null);
  }

  useEffect(() => { void loadWorkspace(); }, []);

  async function createProduct() {
    const response = await fetch("/api/products", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: productName, market: "美国", channel: "Amazon US" }) });
    if (!response.ok) { toast("商品创建失败，请稍后重试"); return; }
    const data = await response.json() as { product: ProductRecord };
    setProductDialogOpen(false);
    setProductName("");
    setProductRows(rows => [data.product, ...rows]);
    setActiveProduct(data.product);
    toast(`已创建「${data.product.name}」，正在准备研究工作区`);
    window.setTimeout(() => navigate("research"), 400);
  }

  async function selectProduct(id: string) {
    const response = await fetch(`/api/products/${id}`, { cache: "no-store" });
    if (!response.ok) return;
    const detail = await response.json() as { product: ProductRecord; tasks?: TaskRecord[]; listing?: ListingRecord | null; research?: ResearchResultRecord | null };
    setActiveProduct(detail.product);
    setTaskRows(detail.tasks ?? []);
    setListing(detail.listing ?? null);
    setResearch(detail.research ?? null);
  }

  async function runTask(type: TaskType) {
    if (!activeProduct?.id || activeProduct.id === "fallback") { toast("请先创建一个可持久化的商品项目"); return; }
    const response = await fetch(`/api/products/${activeProduct.id}/tasks`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type }) });
    if (response.ok) { const data = await response.json() as { task?: TaskRecord }; toast(data.task?.status === "failed" ? "任务失败，错误已记录" : `${type} 任务已完成并保存`); await loadWorkspace(); } else toast("任务执行失败，请稍后重试");
  }

  const sharedProps = { navigate, toast, selectProduct, product: activeProduct, products: productRows, tasks: taskRows, listing, research, productId: activeProduct?.id, runTask, refresh: loadWorkspace };
  const view = { overview: <OverviewView {...sharedProps} />, products: <ProductsView {...sharedProps} />, research: <ResearchView {...sharedProps} />, listing: <ListingView {...sharedProps} />, assets: <AssetsView {...sharedProps} />, store: <StoreView {...sharedProps} />, seo: <SeoView {...sharedProps} />, tasks: <TasksView {...sharedProps} />, settings: <SettingsView {...sharedProps} /> }[currentView];

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">✦</div><div><strong>跨境 AI 工作台</strong><span>Crossborder AI OS · MVP</span></div></div><button className="workspace-switcher" onClick={() => toast("工作区切换将在团队版开放")}><span className="avatar avatar-yellow">林</span><div><b>Lin 的工作区</b><span>个人工作区</span></div><span className="chevron">⌄</span></button><nav className="nav-group">{navigationGroups.map(group => <div key={group.label || "settings"}><p className="nav-label">{group.label}</p>{group.items.map(item => <button key={item.key} className={`nav-item ${currentView === item.key ? "active" : ""}`} onClick={() => navigate(item.key)}><span className="nav-icon">{item.icon}</span>{viewNames[item.key]}{item.badge && <em>{item.badge}</em>}{item.dot && <i className="dot" />}</button>)}</div>)}</nav><div className="sidebar-bottom"><div className="usage-card"><div className="usage-top"><span>本月用量</span><b>68 / 100</b></div><Progress value={68} /><small>下次重置：10 月 1 日</small></div><div className="user-mini"><span className="avatar avatar-blue">林</span><div><b>林晓</b><span>lin@example.com</span></div><span>•••</span></div></div></aside>
    <main className="main-content"><header className="topbar"><div className="breadcrumbs"><span>工作台</span><b>/</b><strong>{viewNames[currentView]}</strong></div><div className="top-actions"><button className="icon-btn" onClick={() => toast("暂无新的通知")}>⌕</button><button className="icon-btn has-dot" onClick={() => toast("有 2 个待确认事项")}>♧</button><span className="top-avatar">林</span></div></header><div className="content-wrap">{view}</div></main>
    {copilotOpen ? <aside className="copilot" aria-label="AI Copilot"><div className="copilot-head"><div><span className="copilot-spark">✦</span><div><b>AI Copilot</b><small>正在查看：{activeProduct?.name ?? "当前商品"}</small></div></div><button className="icon-btn" aria-label="收起" onClick={() => setCopilotOpen(false)}>×</button></div><div className="copilot-body"><div className="copilot-welcome"><div className="copilot-avatar">✦</div><p>你好，林晓。我已经读完了这个商品的研究、Listing 和素材。你想继续推进哪一步？</p></div><div className="suggestions"><button onClick={() => sendMessage("根据研究机会，帮我优化 Listing")}>根据研究机会优化 Listing <span>→</span></button><button onClick={() => sendMessage("为商品页补充 FAQ")}>为商品页补充 FAQ <span>→</span></button><button onClick={() => sendMessage("解释为什么 SEO 分数是 82")}>解释 SEO 分数 <span>→</span></button></div><div className="chat-log">{messages.map((message, index) => <div key={`${message}-${index}`} className={index % 2 === 0 ? "chat-bubble" : "bot-bubble"}>{message}</div>)}</div></div><div className="copilot-input"><input value={copilotInput} onChange={event => setCopilotInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter") sendMessage(copilotInput); }} placeholder="问问当前商品…" /><button onClick={() => sendMessage(copilotInput)}>↑</button></div></aside> : <button className="copilot-reopen" onClick={() => setCopilotOpen(true)}>✦ Copilot</button>}
    <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}><DialogContent><div className="modal-step">STEP 1 / 3</div><h2>你想卖什么？</h2><p>先告诉我一个商品想法，后面所有研究和创作都会围绕它展开。</p><label>商品名称<input value={productName} onChange={event => setProductName(event.target.value)} placeholder="例如：便携式净水滤芯水壶" autoFocus /></label><label>目标市场<div className="select-row"><button className="select-choice active">🇺🇸 美国</button><button className="select-choice">🇬🇧 英国</button><button className="select-choice">🇩🇪 德国</button></div></label><label>销售渠道<select defaultValue="Amazon US"><option>Amazon US</option><option>Shopify 独立站</option><option>TikTok Shop</option></select></label><Button className="full" onClick={() => void createProduct()}>创建商品项目 →</Button></DialogContent></Dialog>
    <button className="floating-create" onClick={() => setProductDialogOpen(true)}>＋ 创建商品</button><div className={`toast ${toastMessage ? "show" : ""}`} role="status">{toastMessage}</div>
  </div>;
}
