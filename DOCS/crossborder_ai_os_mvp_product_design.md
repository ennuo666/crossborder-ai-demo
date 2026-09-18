# 跨境电商 AI 工作台 MVP 产品设计文档

版本 0.1，面向首批内测与前端原型开发。

## 1. 文档目的

明确第一版产品的定位、核心用户、关键使用流程、主要页面和功能边界，为产品原型、技术拆分以及 Cursor / Claude Code 开发提供统一依据。本文件只描述 MVP 的整体方向，不展开到完整接口协议、视觉规范或运营方案。

## 2. 产品定位

跨境电商 AI 工作台是一套以商品为中心的 AI 原生经营工具，帮助 Amazon、Shopify、TikTok Shop 及独立站卖家，把一个商品从想法快速推进到可以销售的商品页面。

平台不把 Motiful、Apify MCP、Claude SEO、YourNextStore 等项目简单并列展示，而是将它们组织成一条连续工作流：

> 竞品调研 → 商品定位 → Listing → 商品素材 → 独立站 → SEO → 发布

### MVP 核心价值

- 用户只需录入一次商品上下文，后续研究、文案、图片、建站和 SEO 任务共享同一份商品数据。
- 把原始采集结果转化为可执行结论，例如价格区间、差评痛点、卖点机会和定位建议。
- 通过统一界面调用多个开源能力，降低跨工具切换和部署成本。
- 优先证明“从商品 IDEA 到可发布商品页”的闭环，而不是先做完整 ERP。

## 3. 目标用户与使用场景

| 用户类型 | 主要需求 | MVP 关注点 |
|---|---|---|
| 独立站卖家 | 快速验证新品并上线商品页 | 竞品分析、素材、落地页、SEO |
| Amazon / 平台卖家 | 优化 Listing 和广告素材 | 标题、五点、关键词、图片 |
| 小型跨境团队 | 减少研究和内容制作的人力 | 共享商品工作区、任务历史、统一资产 |

首批用户建议聚焦于已有商品或明确选品方向、但缺少设计、内容和技术资源的小型跨境卖家。MVP 暂不以大型品牌的复杂权限、供应链或 ERP 流程为目标。

## 4. 核心用户流程

| 阶段 | 用户动作 | 系统产出 |
|---|---|---|
| 1 创建商品 | 填写商品名、目标市场、销售渠道，可选填竞品 URL | Product Workspace |
| 2 竞品研究 | 启动竞品分析，等待采集和 AI 总结 | 价格、卖点、差评痛点、关键词、机会 |
| 3 生成内容 | 确认定位后生成 Listing | 标题、五点、描述、关键词、多语言版本 |
| 4 生成素材 | 选择场景和渠道 | 主图、场景图、广告图、社媒素材 |
| 5 创建页面 | 选择主题并生成商品页或 Landing Page | 可预览的独立站页面 |
| 6 SEO 优化 | 运行审计并采纳建议 | SEO 分数、问题清单、Schema 和内容建议 |
| 7 发布 | 确认内容后发布到目标站点 | 可访问的商品页面和任务记录 |

## 5. MVP 功能范围

| 模块 | 第一版主要功能 | 优先级 |
|---|---|---|
| Dashboard | 商品数、进行中的任务、SEO 状态、最近竞品动态、快捷入口 | P0 |
| 商品中心 | 商品 / SKU、图片、描述、市场、渠道、状态和资产管理 | P0 |
| 竞品研究 | 输入 URL 或关键词；采集竞品；输出价格、卖点、差评和机会总结 | P0 |
| AI Listing | 标题、五点、详情描述、关键词、多语言生成与编辑 | P0 |
| AI 素材 | 主图、场景图、广告图、社媒图生成与资产保存 | P0 |
| 建站与商品页 | 主题选择、商品信息同步、页面预览、Landing Page 生成 | P0 |
| SEO | 站点审计、关键词建议、Schema、GEO / AI 搜索优化建议 | P1 |
| AI Copilot | 围绕当前商品进行问答，并调用研究、内容和素材工具 | P1 |
| 任务与用量 | 任务历史、失败重试、积分 / 用量、API Key 与集成状态 | P1 |

P0 是首个可用闭环必须具备的能力；P1 用于提升连续使用体验，可以在核心流程跑通后补齐。

## 6. 商品工作区设计

商品工作区是产品的核心容器。所有研究结论、文案、图片、页面和 SEO 结果都挂在商品项目下，避免用户在不同工具之间重复输入。

| 工作区区域 | 展示内容 |
|---|---|
| Overview | 商品基本信息、当前阶段、完成度、SEO 分数和下一步建议 |
| Market Intelligence | 竞品列表、价格区间、评论痛点、卖点、关键词和市场机会 |
| Content | Listing、图片、广告创意、社媒内容及版本记录 |
| Store | 商品页、Landing Page、主题、预览和发布状态 |
| SEO | 审计结果、关键词、Schema、GEO 建议和待办项 |

每个模块都应提供下一步动作，例如“根据机会生成 Listing”“用当前定位生成 5 张广告图”“修复高优先级 SEO 问题”，让页面形成连续操作链路。

## 7. 页面与导航结构

建议采用左侧主导航、顶部工作区上下文和右侧 AI Copilot 的布局：

- **Overview**：Dashboard
- **Products**：All Products、New Product、Product Workspace
- **Market Intelligence**：Competitors、Product Research
- **AI Studio**：Product Images、Listings、Ads & Social
- **Store**：Websites、Landing Pages、Publish
- **Growth**：SEO、Keywords、Content
- **Automations**：后续版本；MVP 仅保留入口或简单任务编排
- **Settings**：Integrations、API Keys、Usage、Account

首次使用入口建议使用“What do you want to sell?”，用三步表单创建商品项目，再自动展示研究进度和工作区结果。

## 8. 开源项目与平台的关系

平台采用 Adapter Layer，而不是把多个仓库直接复制到同一代码库。平台定义稳定的业务能力接口，底层项目作为可替换的实现。

| 能力 | MVP 适配项目 | 平台封装后的业务接口 |
|---|---|---|
| 商品素材 | Motiful product-shots | generateProductImages() |
| 竞品数据 | Apify MCP Server | analyzeCompetitor() |
| SEO | Claude SEO 及 LLM | runSeoAudit() |
| 独立站 / 商品页 | YourNextStore | createStore()、publishStore() |
| AI 推理与编排 | LLM Gateway + Agent Loop | generateListing()、recommendNextAction() |

Internet Court 暂不进入支付主链路。第一版将其放入 Labs 或后续路线，用于探索 AI Agent 授权采购、自动结算、托管和争议解决。

## 9. 技术方向

| 层级 | 建议方案 |
|---|---|
| 前端 | Next.js、TypeScript、Tailwind CSS、shadcn/ui |
| 后端与数据 | Next.js API 或 NestJS、PostgreSQL、Prisma / Drizzle |
| 异步任务 | Redis + BullMQ，用于采集、生成、审计和发布任务 |
| 文件与资产 | S3 或 Cloudflare R2 |
| 模型层 | LLM Gateway，统一封装 DeepSeek / Claude / OpenAI / Gemini 等模型 |
| 集成层 | Motiful、Apify、Claude SEO、YourNextStore Adapter |

LLM Gateway 和 Adapter Layer 应从第一天建立，避免业务代码直接绑定单一模型或单一开源项目。用户侧只看到统一的产品能力，底层实现可以替换。

## 10. 明确暂缓的功能

- 复杂库存、采购、仓库和物流管理
- 财务、结算、发票和完整订单 ERP
- CRM、客服工单和售后系统
- 几十个平台的深度同步与多店铺管理
- 高级自动化编排、复杂 BI 和团队审批
- Internet Court 驱动的 Agent 支付与自动交易结算

## 11. MVP 验收标准

| 验收项 | 判断标准 |
|---|---|
| 闭环可用 | 新用户能在一个商品工作区中完成研究、Listing、素材、页面和 SEO 基本流程 |
| 上下文共享 | 竞品结论能被 Listing、图片和页面生成继续使用，无需重复录入 |
| 结果可编辑 | AI 输出均可人工修改、保存版本并再次生成 |
| 任务可追踪 | 长任务有状态、进度、失败原因和重试入口 |
| 集成可替换 | 底层开源项目通过 Adapter 接入，不把供应商细节泄露到业务层 |
| Demo 有说服力 | 输入一个真实商品后，能展示从市场机会到可销售页面的连续结果 |

## 12. 后续路线

| 阶段 | 重点 |
|---|---|
| MVP | 完成单商品工作区和研究 → 内容 → 素材 → 商品页 → SEO 闭环 |
| V1 | 增加多商品、多渠道发布、团队协作、内容日历和基础自动化 |
| V2 | 接入订单 / 库存等运营能力，建设跨平台数据层和更强 Agent |
| Labs | 探索 Internet Court、AI Agent 采购、授权和自动结算 |

最终护城河不是某个 GitHub 项目本身，而是持续积累的商品上下文、工作流、Agent 能力和跨平台数据。

## 一句话定义

> 帮助跨境卖家把一个商品从 IDEA 变成可以销售的商品页面。
