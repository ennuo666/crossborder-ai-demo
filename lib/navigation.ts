import type { ViewKey } from "./types";

export const viewNames: Record<ViewKey, string> = {
  overview: "总览", products: "商品中心", research: "竞品研究", listing: "Listing 文案", assets: "商品素材",
  store: "独立站", seo: "SEO 优化", tasks: "任务记录", settings: "设置",
};

type NavigationItem = { key: ViewKey; icon: string; badge?: string; dot?: boolean };
type NavigationGroup = { label: string; items: NavigationItem[] };

export const navigationGroups: NavigationGroup[] = [
  { label: "工作台", items: [{ key: "overview", icon: "▦" }, { key: "products", icon: "◇", badge: "3" }] },
  { label: "市场智能", items: [{ key: "research", icon: "⌕" }] },
  { label: "AI 创作", items: [{ key: "listing", icon: "Aa" }, { key: "assets", icon: "▧" }] },
  { label: "增长", items: [{ key: "store", icon: "⌂" }, { key: "seo", icon: "◌", dot: true }, { key: "tasks", icon: "✓" }] },
  { label: "", items: [{ key: "settings", icon: "⚙" }] },
];
