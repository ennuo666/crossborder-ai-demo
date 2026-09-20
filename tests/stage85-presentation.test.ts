import test from "node:test";
import assert from "node:assert/strict";
import { compactNumber, money, researchKpis, safeSourceLink } from "@/lib/workspace-presentation";
import { createInMemoryRepositories } from "@/repositories/in-memory-repository";
import { startResearch } from "@/services/research-service";

test("competitor presentation formats facts without inventing missing values", async context => {
  const previousAi = process.env.AI_PROVIDER, previousMarketplace = process.env.MARKETPLACE_PROVIDER;
  process.env.AI_PROVIDER = "mock"; process.env.MARKETPLACE_PROVIDER = "mock";
  context.after(() => {
    if (previousAi === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = previousAi;
    if (previousMarketplace === undefined) delete process.env.MARKETPLACE_PROVIDER; else process.env.MARKETPLACE_PROVIDER = previousMarketplace;
  });
  assert.equal(money(null), "暂无价格"); assert.equal(compactNumber(undefined), "暂无数据");
  assert.equal(money(19.99), "$19.99"); assert.equal(compactNumber(86200), "86.2K");
  const repos = createInMemoryRepositories();
  const product = await repos.products.create({ name: "charger", userId: "a", channel: "Amazon US", market: "US" });
  await startResearch(product.id, undefined, repos);
  const research = (await repos.research.latestByProduct(product.id))!;
  const kpis = researchKpis({ ...research, stats: { ...research.stats, averageRating: 4.499999 } });
  assert.deepEqual(kpis.map(item => item.label), ["竞品数量", "价格区间", "中位价格", "平均评分", "平均评论数", "详情数据覆盖"]);
  assert.equal(kpis[3].value, "4.50");
  assert.equal(researchKpis({ ...research, stats: {} })[3].value, "暂无数据");
});

test("Amazon source links reject unsafe URLs and lookalike hosts", () => {
  assert.equal(safeSourceLink("https://www.amazon.com/dp/B012345678"), "https://www.amazon.com/dp/B012345678");
  for (const value of [null, "javascript:alert(1)", "http://amazon.com/dp/x", "https://amazon.com.attacker.test/x", "https://evil-amazon.com/x"]) assert.equal(safeSourceLink(value), null);
});
