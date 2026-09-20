"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Boxes, ChartNoAxesCombined, Check, ChevronRight, CircleHelp, ClipboardList, FileText, Globe, Image, LayoutDashboard, LogOut, Menu, Search, Settings, Sparkles, X } from "lucide-react";
import type { ListingRecord, ProductRecord, ProductSummary, ResearchResultRecord, TaskRecord, TaskType, ViewKey } from "@/lib/types";
import { authClient } from "@/lib/auth-client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { isActiveTask } from "@/lib/workspace-presentation";
import { OverviewView, ProductsView, ResearchView, ListingView, TasksView, SettingsView, ComingSoonView } from "./views";
import { Badge, ErrorState, Skeleton } from "./primitives";
import type { WorkspaceViewProps } from "./contracts";
import "./workspace.css";

const navigation = [
  { key: "overview", label: "工作台总览", icon: LayoutDashboard, group: "工作台" },
  { key: "products", label: "商品中心", icon: Boxes },
  { key: "research", label: "竞品研究", icon: ChartNoAxesCombined, group: "核心流程" },
  { key: "listing", label: "Listing 工作台", icon: FileText },
  { key: "tasks", label: "任务记录", icon: ClipboardList },
  { key: "assets", label: "商品素材", icon: Image, group: "更多能力", soon: true },
  { key: "store", label: "独立站", icon: Globe, soon: true },
  { key: "seo", label: "SEO 优化", icon: Search, soon: true },
  { key: "settings", label: "账户信息", icon: Settings },
] as const;
type Detail = { product: ProductRecord; tasks: TaskRecord[]; research: ResearchResultRecord | null; listings: ListingRecord[] };

export function WorkspaceApp({ user }: { user: { name: string; email: string } }) {
  const [currentView, setCurrentView] = useState<ViewKey>("overview");
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [summaries, setSummaries] = useState<ProductSummary[]>([]);
  const [recentTasks, setRecentTasks] = useState<TaskRecord[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [productName, setProductName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [toast, setToast] = useState("");
  const activeId = useRef<string | null>(null);
  const viewRef = useRef<ViewKey>("overview");
  const sequence = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittingTask = useRef(false);
  const previouslyActive = useRef(false);
  const storageKey = `workspace-product:${user.email}`;

  const notify = useCallback((message: string) => { setToast(message); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(""), 4000); }, []);
  const updateUrl = useCallback(() => { const query = new URLSearchParams({ view: viewRef.current }); if (activeId.current) query.set("product", activeId.current); window.history.replaceState(null, "", `/?${query}`); }, []);
  const loadWorkspace = useCallback(async () => {
    const requestId = ++sequence.current;
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      if (response.status === 401) { window.location.assign("/login"); return; }
      if (!response.ok) throw new Error("商品列表加载失败，请稍后重试。");
      const data = await response.json() as { products: ProductRecord[]; summaries: ProductSummary[]; recentTasks: TaskRecord[] };
      const selected = data.products.find(product => product.id === activeId.current) ?? data.products[0];
      let nextDetail: Detail | null = null;
      if (selected) {
        const result = await fetch(`/api/products/${selected.id}`, { cache: "no-store" });
        if (!result.ok) throw new Error("商品内容加载失败，请重试。");
        nextDetail = await result.json() as Detail;
      }
      if (requestId !== sequence.current) return;
      setProducts(data.products); setSummaries(data.summaries ?? []); setRecentTasks(data.recentTasks ?? []); setDetail(nextDetail);
      activeId.current = selected?.id ?? null;
      if (selected) window.localStorage.setItem(storageKey, selected.id);
      setError(""); updateUrl();
    } catch (cause) { if (requestId === sequence.current) setError(cause instanceof Error ? cause.message : "加载失败"); }
    finally { if (requestId === sequence.current) setLoading(false); }
  }, [storageKey, updateUrl]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const initialView = query.get("view") as ViewKey;
    if (navigation.some(item => item.key === initialView)) { setCurrentView(initialView); viewRef.current = initialView; }
    activeId.current = query.get("product") ?? window.localStorage.getItem(storageKey);
    void loadWorkspace();
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, [loadWorkspace, storageKey]);
  useEffect(() => {
    const active = recentTasks.some(isActiveTask) || summaries.some(summary => summary.tasks.some(isActiveTask));
    const justFinished = previouslyActive.current && !active;
    previouslyActive.current = active;
    if (!active && !justFinished) return;
    const timer = setTimeout(() => void loadWorkspace(), justFinished ? 500 : 1500);
    return () => clearTimeout(timer);
  }, [recentTasks, summaries, loadWorkspace]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const canNavigate = () => !dirty || window.confirm("当前文案修改尚未保存。要放弃修改吗？");
  function navigate(view: ViewKey) { if (view !== currentView && !canNavigate()) return; if (view !== currentView) setDirty(false); setCurrentView(view); viewRef.current = view; setMobileNav(false); updateUrl(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function openProduct(id: string, view: ViewKey) {
    if (!canNavigate()) return;
    setDirty(false); activeId.current = id; setCurrentView(view); viewRef.current = view; setLoading(true); updateUrl(); void loadWorkspace();
  }
  async function createProduct(event: React.FormEvent) {
    event.preventDefault(); if (creating || !productName.trim()) return;
    setCreating(true); setCreateError("");
    try {
      const response = await fetch("/api/products", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: productName.trim(), market: "美国", channel: "Amazon US" }) });
      if (!response.ok) throw new Error("商品创建失败，请稍后重试。");
      const data = await response.json() as { product: ProductRecord };
      activeId.current = data.product.id; setCreateOpen(false); setProductName(""); setDirty(false); setCurrentView("research"); viewRef.current = "research";
      setLoading(true); await loadWorkspace(); notify("商品已创建，可以开始竞品研究");
    } catch (cause) { setCreateError(cause instanceof Error ? cause.message : "创建失败"); }
    finally { setCreating(false); }
  }
  async function runTask(type: TaskType) {
    if (!activeId.current || submittingTask.current) return;
    submittingTask.current = true;
    try {
      const response = await fetch(`/api/products/${activeId.current}/tasks`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type }) });
      if (!response.ok) throw new Error("任务提交失败，请重试。");
      const data = await response.json() as { task: TaskRecord };
      setDetail(current => current ? { ...current, tasks: [data.task, ...current.tasks] } : current);
      setRecentTasks(current => [data.task, ...current]); notify("任务已排队，完成后自动更新");
    } catch (cause) { notify(cause instanceof Error ? cause.message : "任务提交失败"); }
    finally { submittingTask.current = false; }
  }
  function sendMessage() { notify("Copilot 仍在 Beta 准备阶段，请使用竞品研究和 Listing 工作台。"); }
  const create = () => { if (!canNavigate()) return; setCreateError(""); setCreateOpen(true); };
  const shared: WorkspaceViewProps = { user, products, summaries, recentTasks, product: detail?.product ?? null, research: detail?.research ?? null, listings: detail?.listings ?? [], tasks: detail?.tasks ?? [], navigate, openProduct, create, notify, runTask, refresh: loadWorkspace, dirty, setDirty };
  const views = { overview: <OverviewView {...shared} />, products: <ProductsView {...shared} />, research: <ResearchView {...shared} />, listing: <ListingView key={detail?.product.id} {...shared} />, tasks: <TasksView {...shared} />, settings: <SettingsView {...shared} />, assets: <ComingSoonView name="商品素材" />, store: <ComingSoonView name="商品页预览" />, seo: <ComingSoonView name="SEO 优化" /> };
  return <div className="ws-shell">
    <aside className={`ws-sidebar ${mobileNav ? "ws-nav-open" : ""}`}><button className="ws-brand" onClick={() => navigate("overview")}><span><Boxes size={22} /></span><div><strong>跨境 AI 工作台</strong><small>SELLER WORKSPACE</small></div></button><div className="ws-workspace-label"><span className="ws-avatar">{user.name.slice(0, 1)}</span><div><strong>{user.name}的工作区</strong><small>个人工作区 <Badge>Beta</Badge></small></div></div><nav aria-label="工作台导航">{navigation.map(item => <div key={item.key}>{"group" in item && <p className="ws-nav-label">{item.group}</p>}<button aria-current={currentView === item.key ? "page" : undefined} className={`ws-nav-item ${currentView === item.key ? "is-active" : ""} ${"soon" in item ? "ws-coming" : ""}`} onClick={() => navigate(item.key)}><item.icon size={18} /><span>{item.label}</span>{"soon" in item ? <small>即将推出</small> : item.key === "products" ? <em>{products.length}</em> : null}</button></div>)}</nav><div className="ws-sidebar-footer"><div className="ws-help"><CircleHelp size={16} /><span>Amazon 研究与内容创作</span></div><div className="ws-user"><span className="ws-avatar">{user.name.slice(0, 1)}</span><div><strong>{user.name}</strong><small title={user.email}>{user.email}</small></div><button className="ws-icon-button" title="退出登录" aria-label="退出登录" onClick={() => { if (canNavigate()) void authClient.signOut().then(() => window.location.assign("/login")); }}><LogOut size={16} /></button></div></div></aside>
    <div className="ws-main"><header className="ws-topbar"><button className="ws-mobile-menu ws-icon-button" title="打开导航" onClick={() => setMobileNav(value => !value)}><Menu size={19} /></button><div className="ws-breadcrumb"><span>我的工作区</span><ChevronRight size={14} /><strong>{navigation.find(item => item.key === currentView)?.label}</strong></div><div className="ws-topbar-actions">{!!products.length && <select aria-label="当前商品" value={detail?.product.id ?? ""} onChange={event => openProduct(event.target.value, currentView)}>{products.map(product => <option value={product.id} key={product.id}>{product.name}</option>)}</select>}<button className="ws-button ws-secondary ws-copilot-trigger" onClick={() => setCopilotOpen(true)}><Sparkles size={15} />Copilot<Badge>Beta</Badge></button></div></header><main className="ws-content" id="main-content">{loading ? <Skeleton /> : error ? <ErrorState message={error} retry={() => { setLoading(true); void loadWorkspace(); }} /> : views[currentView]}</main><footer className="ws-page-footer"><span>跨境 AI 工作台</span><span>以事实为依据，让商品决策更清晰。</span></footer></div>
    <Dialog open={createOpen} onOpenChange={value => { if (!creating) setCreateOpen(value); }}><DialogContent className="ws-dialog"><DialogTitle>创建商品项目</DialogTitle><DialogDescription>输入你的商品方向，研究将围绕它搜索 Amazon US 竞品。</DialogDescription><form onSubmit={event => void createProduct(event)}><label>商品名称<input autoFocus aria-label="商品名称" value={productName} onChange={event => setProductName(event.target.value)} placeholder="例如：wireless charger" maxLength={200} required /></label><div className="ws-create-market"><span className="ws-market-logo">a</span><div><strong>Amazon US</strong><small>美国市场 · 英文 Listing</small></div><Check size={17} /></div>{createError && <p role="alert" className="ws-form-error">{createError}</p>}<button type="submit" className="ws-button" disabled={creating || !productName.trim()}>{creating ? "正在创建" : "创建商品项目"}<ArrowRight size={16} /></button></form></DialogContent></Dialog>
    <Dialog open={copilotOpen} onOpenChange={setCopilotOpen}><DialogContent className="ws-dialog"><DialogTitle>AI Copilot <Badge>Beta</Badge></DialogTitle><DialogDescription>对话助手尚未开放。你可以在核心工作台继续处理当前商品。</DialogDescription><div className="ws-copilot-links"><button className="ws-button ws-secondary" onClick={() => { setCopilotOpen(false); navigate("research"); }}><Search size={16} />查看竞品研究</button><button className="ws-button" onClick={() => { setCopilotOpen(false); navigate("listing"); }}><FileText size={16} />编辑 Listing</button><button className="ws-text-button" onClick={sendMessage}>查看开放状态</button></div></DialogContent></Dialog>
    {toast && <div className="ws-toast" role="status"><Check size={16} /><span>{toast}</span><button aria-label="关闭提示" onClick={() => setToast("")}><X size={14} /></button></div>}
  </div>;
}
