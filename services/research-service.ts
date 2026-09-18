export type ResearchResult = { competitorCount: number; coverage: string; priceRange: string; opportunities: string[] };
export function getMockResearch(): ResearchResult { return { competitorCount: 24, coverage: "82%", priceRange: "$28 — $42", opportunities: ["过滤速度快", "一键更换滤芯", "适配冰箱门"] }; }
