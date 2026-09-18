const fs = require("fs");
const assert = require("assert");

const read = file => fs.readFileSync(file, "utf8");
const packageJson = JSON.parse(read("package.json"));
const nextConfig = read("next.config.ts");

assert.equal(packageJson.scripts.dev, "next dev");
assert.equal(packageJson.scripts.typecheck, "tsc --noEmit");
assert.ok(packageJson.dependencies.next);
assert.ok(packageJson.dependencies.react);
assert.ok(packageJson.devDependencies.tailwindcss);
assert.match(nextConfig, /devtoolSegmentExplorer:\s*false/);

for (const file of [
  "app/layout.tsx", "app/page.tsx", "app/globals.css",
  "components/workspace/workspace-app.tsx", "components/workspace/views.tsx",
  "components/ui/button.tsx", "components/ui/dialog.tsx",
  "lib/mock-data.ts", "services/product-service.ts", "services/task-service.ts",
  "adapters/types.ts", "adapters/mock/index.ts",
  "prisma/schema.prisma", "repositories/types.ts", "repositories/in-memory-repository.ts", "repositories/prisma-repository.ts",
  "app/api/products/route.ts", "app/api/products/[id]/route.ts", "app/api/products/[id]/listing/route.ts", "app/api/products/[id]/tasks/route.ts",
]) {
  assert.ok(fs.existsSync(file), `Missing migrated file: ${file}`);
}

const app = read("components/workspace/workspace-app.tsx");
const views = read("components/workspace/views.tsx");
const navigation = read("lib/navigation.ts");
for (const view of ["overview", "products", "research", "listing", "assets", "store", "seo", "tasks", "settings"]) {
  assert.match(app, new RegExp(`${view}:`));
}
for (const label of ["总览", "商品中心", "竞品研究", "Listing 文案", "商品素材", "商品页预览", "SEO 优化", "任务记录", "设置", "AI Copilot"]) {
  assert.ok(app.includes(label) || views.includes(label) || navigation.includes(label), `Missing UI label: ${label}`);
}
assert.match(app, /createProduct/);
assert.match(app, /sendMessage/);
assert.match(views, /生成新版本/);
assert.match(views, /运行审计/);
assert.match(read("prisma/schema.prisma"), /model Product/);
assert.match(read("prisma/schema.prisma"), /model Task/);
assert.match(read("prisma/schema.prisma"), /model ResearchResult/);
assert.match(read("prisma/schema.prisma"), /model Listing/);
assert.match(read("prisma/schema.prisma"), /model Asset/);
assert.match(read("prisma/schema.prisma"), /model SeoAudit/);
assert.doesNotMatch(app, /@\/lib\/mock-data/);

console.log("Next.js migration smoke test passed");
