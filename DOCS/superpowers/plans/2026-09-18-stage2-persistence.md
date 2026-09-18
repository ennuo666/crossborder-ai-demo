# Stage 2 Persistence and Task Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the Next.js MVP from UI-local mock state to a Prisma/PostgreSQL-ready persistence and task-state foundation while keeping the existing dashboard visual structure.

**Architecture:** Prisma owns the PostgreSQL schema and generated client. Repository interfaces isolate persistence; Prisma and in-memory mock repositories implement the same contracts. Domain services create products, listings, assets, research results, SEO audits, and tasks; Route Handlers expose those services to the existing client UI. External capabilities remain mock adapters behind task orchestration.

**Tech Stack:** Next.js App Router, TypeScript, Prisma, PostgreSQL, Node test runner through `tsx`, existing Tailwind CSS and shadcn/ui components.

**Spec:** `DOCS/crossborder_ai_os_mvp_technical_plan.docx` and `DOCS/crossborder_ai_os_mvp_product_design.md`.

## Global Constraints

- Keep current Chinese UI and major interactions; do not perform a visual redesign.
- Do not modify `DOCS/crossborder_ai_os_mvp_technical_plan.docx`.
- Do not connect real AI, Apify, Motiful, Claude SEO, or YourNextStore services in this stage.
- Keep mock capabilities behind service and adapter boundaries.
- Use `queued`, `running`, `succeeded`, `failed`, and `cancelled` task states.
- Every completed change must have tests and a Git commit.

### Task 1: Add Prisma schema and test tooling

**Files:**
- Create: `prisma/schema.prisma`, `.env.example`, `tests/stage2-data-layer.test.ts`
- Modify: `package.json`, `README.md`

- [x] Add Prisma/PostgreSQL dependencies and a `test:unit` script using `tsx --test`.
- [x] Define Product, Task, ResearchResult, Listing, Asset, and SeoAudit models plus enums and indexes.
- [x] Write failing tests for product creation, task transitions, listing persistence, and loading the latest listing.
- [x] Run `npm run test:unit` and confirm failure is caused by missing repositories/services.

### Task 2: Implement repository contracts and adapters

**Files:**
- Create: `repositories/types.ts`, `repositories/in-memory-repository.ts`, `repositories/prisma-repository.ts`, `lib/prisma.ts`
- Modify: `adapters/types.ts`

- [x] Implement typed repository interfaces for products, tasks, listings, research results, assets, and SEO audits.
- [x] Implement an in-memory adapter seeded from the current mock data for tests and local fallback.
- [x] Implement Prisma repository methods using the generated Prisma client.
- [x] Make repository selection use Prisma when `DATABASE_URL` exists and in-memory fallback otherwise.
- [x] Run unit tests and confirm repository behaviors pass.

### Task 3: Move mock capabilities behind task services

**Files:**
- Modify: `services/product-service.ts`, `services/task-service.ts`, `services/research-service.ts`, `services/content-service.ts`, `services/asset-service.ts`, `services/seo-service.ts`, `adapters/mock/index.ts`
- Create: `services/listing-service.ts`

- [x] Add async product creation that persists Product and creates a queued task when requested.
- [x] Add task runner functions that create queued tasks, set running, call a mock adapter, persist the domain result, and finish succeeded or failed.
- [x] Add listing save/load and listing-generation task functions.
- [x] Keep all mock output in adapters or service defaults; UI must not construct task results directly.
- [x] Run unit tests and verify task state transitions and saved results.

### Task 4: Add Route Handlers

**Files:**
- Create: `app/api/products/route.ts`, `app/api/products/[id]/route.ts`, `app/api/products/[id]/listing/route.ts`, `app/api/products/[id]/tasks/route.ts`

- [x] Add GET/POST products, GET product detail, GET/POST listing, and GET/POST product tasks.
- [x] Validate required inputs and return JSON errors with appropriate HTTP status codes.
- [x] Keep handlers thin by delegating all persistence and mock execution to services.
- [x] Run typecheck and route smoke tests.

### Task 5: Connect existing UI to APIs

**Files:**
- Modify: `components/workspace/workspace-app.tsx`, `components/workspace/views.tsx`, `lib/types.ts`
- Modify: `test-demo.cjs`

- [x] Load product and task lists from Route Handlers on app start, preserving current seeded display when the API is unavailable.
- [x] POST product creation from the existing dialog and use the returned product/task state.
- [x] Load and save Listing data through the listing Route Handler; generation starts a task through the task Route Handler.
- [x] Research, asset, and SEO buttons start task-state flows through the same task endpoint.
- [x] Extend smoke tests to check API routes and repository boundaries.

### Task 6: Verify, document, and commit

**Files:**
- Modify: `README.md`

- [x] Document `DATABASE_URL`, Prisma generation, migration commands, and mock fallback behavior.
- [x] Run `npm test`, `npm run test:unit`, `npm run typecheck`, `npm run lint`, `npm run build`, and a clean `npm run dev` HTTP smoke test.
- [x] Create one independent Git commit for stage 2.
