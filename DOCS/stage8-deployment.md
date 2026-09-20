# Stage 8: Identity and Deployment

## Authentication

Better Auth provides email/password registration, login, logout, database sessions,
password hashing, cookie management, origin validation and authentication rate limits.
The Next.js catchall handler lives at `/api/auth/[...all]`.
Use `/login`, `/register` and `/api/auth/get-session` for the current identity.
Passwords require 12 characters. Never log auth bodies, headers or cookies.

`User` contains id, email, name, emailVerified, image, createdAt and updatedAt.
`Account`, `Session` and `Verification` use the framework's Prisma schema.
Hashed credentials belong in Account.password, not User or business records.

## Ownership

Product.userId references User. Existing ownerless products remain quarantined;
they are not automatically claimed by the first registered user. The nullable
column preserves historical data. Every authenticated create assigns its session
user, ignoring client userId. User-scoped repository queries filter by owner.
Task ownership follows Task.product.userId; all results follow Product ownership.
Foreign and nonexistent resources both return 404. Unauthenticated requests return
401; workspace navigation redirects to /login. Mutation requests require a matching
Origin, including non-browser clients. There is no public resource-sharing endpoint.

The worker resolves Product and its owner without a browser session. Production
rejects ownerless queued tasks with OWNER_REQUIRED. Do not expose the unscoped
worker repositories directly from future HTTP endpoints.

## Configuration

- DATABASE_URL: PostgreSQL connection (secret).
- REPOSITORY_MODE: prisma; memory is explicit and limited to dev/test.
- BETTER_AUTH_SECRET: at least 32 random characters, stable across restarts.
- BETTER_AUTH_URL: public origin, HTTPS in deployed environments.
- AI_PROVIDER: explicitly mock or openai-compatible.
- MARKETPLACE_PROVIDER: explicitly mock, serpapi or amazon-api.
- Existing provider keys/model/base URL remain server-only environment variables.

Production startup fails for missing database/auth configuration, implicit mock
providers, or real providers with missing keys. Database errors never trigger
in-memory fallback. Build does not run task recovery; server instrumentation does.
`GET /api/health` returns app/database status, with 503 on database failure.

## Deployment

1. Install dependencies with `npm ci`.
2. Supply the environment above through the host's secret manager.
3. Run `npm run prisma:generate` and `npx prisma migrate deploy`.
4. Run `npm run build`, then `npm start`.

Migration `20260920010000_stage8_identity` is additive. It preserves existing
Product rows and adds auth tables, ownership index and foreign keys. Do not reset
an existing database or claim historical rows without verifying their owner.

Run one long-lived Node instance with the in-process worker. Serverless request
lifetimes and multiple competing instances are not supported by this queue.

## Verification

Default `npm test` / `npm run test:unit` include in-memory isolation and production
configuration checks. The Stage 8 ownership test explicitly selects mock providers.

For the production HTTP/database integration (no third-party quota):

```powershell
$env:RUN_DB_INTEGRATION = "1"
$env:PSQL_PATH = "D:/PostgreSQL/bin/psql.exe"
npm run build
npm run test:stage8
```

The runner loads .env.local without printing it, creates a uniquely named empty
database, runs the complete migration chain, starts the production server, and
tests two cookie jars. It covers registration/login/session/logout, empty initial
workspace, owner spoofing, product/task/listing IDOR, mock background Research and
Listing, Asset/SeoAudit persistence and fresh-client reload. The server is stopped
and synthetic users removed afterward; the isolated schema is retained for audit.
The existing market database is never reset by this runner.

## Current Limits

Verification on 2026-09-20: npm test and test:unit passed (17 passed, 4 opt-in
tests skipped); typecheck, lint, build and prisma:validate passed. Migration deploy
succeeded on a newly created PostgreSQL database and additively on the existing
development database. The production HTTP test passed both with the runner and
with an actual npm start server. Browser checks confirmed registration, empty
workspace, product creation, Research/Listing refresh and logout. External
providers were explicitly mocked; this stage did not spend third-party quota.

- Email verification delivery and password reset delivery are not configured yet.
- Auth rate limits are process-local; use one instance for this MVP.
- The in-process queue is not a distributed queue; existing recovery rules apply.
- Historical ownerless data needs an explicit administrative ownership migration.
- Asset generation, publishing and SEO integrations remain unavailable. Their
  pages show owned persisted data or an empty state rather than seeded demo data.
- Dependency audit still reports upstream Prisma config and bundled PostCSS
  advisories. These require a separate dependency upgrade review before public
  exposure; no force upgrade is applied as part of identity integration.
