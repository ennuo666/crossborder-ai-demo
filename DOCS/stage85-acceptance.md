# Stage 8.5 acceptance

Verified on 2026-09-20. Scope: seller workspace UX, persisted research evidence,
bilingual Listing content, and version navigation. Provider interfaces, queue,
worker, authentication and database ownership boundaries are retained.

## UI architecture

- `components/workspace/workspace-app.tsx`: navigation, authenticated data loading,
  product selection, dialogs, toast and task polling.
- `primitives.tsx`: shared sections, badges, task states, skeletons, empty/error
  states, copy controls and keyword chips.
- `research-view.tsx`, `listing-view.tsx`, `overview-view.tsx`, `products-view.tsx`:
  focused page components with a shared contract and scoped stylesheet.
- `lib/workspace-presentation.ts`: Chinese labels, currency/count formatting,
  missing-data handling and validated HTTPS Amazon source links.
- Consistent content width, compact tables, six research KPIs, restrained colors,
  separate Amazon facts and AI insights. Copilot remains a secondary Beta dialog.

## Data and generation

Migration `20260920083000_stage85_research_snapshot_bilingual_listing` adds:

- `ResearchResult.competitorSnapshot`: normalized products used by that research,
  including image/source URLs, ASIN, fact fields and enrichment status.
- `Listing.titleZh`, `bulletsZh`, `descriptionZh`: persistent Chinese reference
  paired with the existing English fields.
- `Listing.researchContext`: frozen research ID/time, sample count, price range,
  pain points and keywords. Editing an old version retains its original context.

The UI reads saved snapshots without calling SerpApi. Amazon links validate host
and protocol. Sponsored and organic labels remain explicit. Missing enrichment
evidence is shown as unknown instead of successful.

Listing generation uses the existing AI Provider with a separate bilingual prompt
and Zod schema requiring five paired bullets. Save creates a new version; selecting
history does not overwrite current content. Cross-product source-version requests
are rejected. Legacy content without translations remains readable.

Research prompts now request Chinese insights and include all normalized samples,
matching the saved sample count. Even-sized price samples use the arithmetic mean
of the middle two values for their median; a regression test covers this correction.

## Verification

| Gate | Result |
| --- | --- |
| `npm test` | 23 passed, 5 opt-in skipped, 0 failures |
| `npm run test:unit` | 23 passed, 5 opt-in skipped, 0 failures |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed, no warnings/errors from ESLint |
| `npm run build` | Passed |
| `npm run prisma:validate` | Passed |
| Stage 8 production HTTP integration | Passed: two users, IDOR 404, two worker tasks, logout |
| Stage 8.5 PostgreSQL integration | Passed: snapshots, bilingual versions, frozen context, fresh client reload |
| Empty database `prisma migrate deploy` | Passed including Stage 8.5 migration |

The production integration created an independent empty database. Existing market
data was not reset. Default tests use fake/mock providers and consume no API quota.

## Real browser flow

An isolated PostgreSQL test database and a synthetic seller account were used.
The browser completed registration, product creation, real SerpApi research,
DeepSeek Listing generation, bilingual title editing/save, second AI generation,
refresh, logout and login. Production preview was also loaded after rebuilding.

Final research for `wireless charger`:

| Observation | Result |
| --- | --- |
| Normalized competitors | 10 |
| Enrichment | 5 / 5 |
| Product images loaded | 10 / 10 |
| Price range | USD 6.99 to 124.99 |
| Median price | USD 14.63 displayed (14.625 calculated) |
| Average rating | 4.34 |
| Average reviews | 28.7K displayed |
| AI model | deepseek-flash |
| Listing history | V1 generated, V2 edited, V3 generated |
| Refresh and new login | All three versions and research retained |

The first research run had 4/5 enrichment; a subsequent real run had 5/5.
Failures remain visible rather than being relabeled successful. Chinese insights,
English/Chinese titles, five paired bullets, descriptions and keywords rendered.
Historical V2 retained the manually edited bilingual titles after V3 was generated.

Desktop checks at 1280, 1440 and 1920 pixels found no document horizontal overflow.
Screenshots were inspected for text overlap, image loading and editor layout.

## Screenshots

Before screenshots show the prior workspace. Main after screenshots show the final
production build; loading and breakpoint captures also include development checks.

| Page | Before | After |
| --- | --- | --- |
| Dashboard | [Before](../artifacts/stage85/before-dashboard.png) | [After](../artifacts/stage85/after-dashboard.png) |
| Products | [Before](../artifacts/stage85/before-products.png) | [After](../artifacts/stage85/after-products.png) |
| Research | [Before](../artifacts/stage85/before-research.png) | [After](../artifacts/stage85/after-research.png) |
| Listing | [Before](../artifacts/stage85/before-listing.png) | [After](../artifacts/stage85/after-listing.png) |

Additional evidence: [AI insights](../artifacts/stage85/after-insights.png),
[loading](../artifacts/stage85/loading-research.png),
[1280 editor](../artifacts/stage85/listing-1280.png),
[1920 research](../artifacts/stage85/research-1920.png).

## Limits

- Existing research without snapshots requires a new research run to display
  competitor evidence. Existing English-only Listings need a new generation for
  Chinese reference; no retrospective paid batch operation is performed.
- Sparse product input produces conservative generic Listing copy. Sellers must
  review factual claims and supply verified product specifications before publishing.
- Brand and other fields may be missing in search-only products. Source prices,
  availability and reviews are historical snapshots, not live guarantees.
- The task UI shows lifecycle/phase labels without claiming exact provider progress.
- Product summaries currently load per-product records; larger datasets will need
  pagination and aggregate queries. Existing single-process queue limits remain.
- Assets, independent storefront and SEO are marked coming soon; Copilot is Beta.
  No publishing, image generation, billing or new marketplace was added.
- `next lint` reports framework deprecation for Next.js 16; current lint passes.

No credentials or raw third-party response fixtures are included in this report.
