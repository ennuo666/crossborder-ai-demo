# 跨境 AI 工作台 MVP

阶段 2 已在 Next.js + TypeScript 应用上增加 Prisma/PostgreSQL 数据层、Product/Task 等 MVP 模型和 Route Handlers。当前使用 Tailwind CSS、shadcn/ui 风格基础组件；未配置 `DATABASE_URL` 时，服务层使用同一接口的 in-memory adapter，外部 AI 和平台能力仍由 mock adapter 执行。

## 本地运行

要求：Node.js 18 或更高版本。Windows 环境可以使用 `D:\XUNLEI\npm.cmd`，或将 `D:\XUNLEI` 加入 PATH。

```powershell
npm install
npm run prisma:generate
npm run dev
```

然后打开 <http://localhost:3000>。

## 可体验流程

- 创建商品：三步表单创建一个商品项目，创建后进入竞品研究
- 竞品研究：查看价格、卖点、痛点和关键词机会
- Listing 文案：编辑标题、五点描述和关键词，生成新版本
- 商品素材：选择主图并模拟生成素材
- 商品页：查看独立站商品页预览并模拟发布
- SEO 优化：查看分数、问题清单和修复入口
- AI Copilot：围绕当前商品发送问题并查看模拟回复

## 阶段 1 目录

- `app/`：Next.js App Router 入口和全局样式
- `components/workspace/`：工作台壳层、导航、Copilot 和页面视图
- `components/ui/`：shadcn/ui 风格的可复用基础组件
- `lib/`：类型、导航和 mock 数据
- `services/`：Product、Task、Research、Content、Asset、SEO 的本地服务边界
- `adapters/`：统一 Adapter 接口和 mock 实现

## 验证命令

```powershell
npm run lint
npm run typecheck
npm run build
npm test
```

## 数据库

复制 `.env.example` 为 `.env`，填入 PostgreSQL 连接字符串：

```powershell
Copy-Item .env.example .env
npm run prisma:generate
npx prisma migrate dev --name init
```

`prisma/schema.prisma` 包含 Product、Task、ResearchResult、Listing、Asset 和 SeoAudit。未设置 `DATABASE_URL` 时，API 会使用内存 adapter 让本地 UI 继续可运行；设置后会自动切换到 Prisma adapter。

阶段 2 的 API 边界：

- `GET/POST /api/products`
- `GET /api/products/:id`
- `GET/POST /api/products/:id/listing`
- `GET/POST /api/products/:id/tasks`
