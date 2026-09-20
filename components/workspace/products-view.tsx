"use client";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { EmptyState, PageHeader } from "./primitives";
import { ProductTable } from "./overview-view";
import type { WorkspaceViewProps } from "./contracts";
export function ProductsView(props: WorkspaceViewProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const rows = props.products.filter(product => {
    const summary = props.summaries.find(item => item.productId === product.id);
    return product.name.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || (filter === "research" ? !summary?.research : !summary?.listingCount));
  });
  return <><PageHeader eyebrow="工作台 / 商品中心" title="我的商品" subtitle="每个商品，一份市场研究，一套可追溯的内容。" actions={<button className="ws-button" onClick={props.create}><Plus size={16} />创建商品</button>} /><div className="ws-list-toolbar"><label className="ws-search"><Search size={17} /><input aria-label="搜索商品" placeholder="搜索商品名称" value={query} onChange={event => setQuery(event.target.value)} /></label><select aria-label="商品进度筛选" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">全部商品</option><option value="research">待研究</option><option value="listing">待生成 Listing</option></select><span className="ws-muted">{rows.length} 个商品</span></div>{rows.length ? <ProductTable {...props} products={rows} /> : <EmptyState title={props.products.length ? "没有匹配的商品" : "创建第一个商品项目"} description={props.products.length ? "试试其他关键词或筛选条件。" : "输入商品方向，开始你的 Amazon 市场研究。"} action={!props.products.length && <button className="ws-button" onClick={props.create}><Plus size={15} />创建商品</button>} />}</>;
}
