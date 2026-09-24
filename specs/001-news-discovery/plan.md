# Implementation Plan: News discovery

**Feature:** `001-news-discovery` | **Date:** 2026-09-12 | **Spec:** [spec.md](spec.md)
**Git branch at planning:** `main`; the feature identifier is not a created branch.
**Status:** Design complete; implementation tasks remain unchecked.

## Summary

Add search and source/category/date filters to the current page. Normalize article
links, assign stable IDs, and collapse repeated destinations before splitting news
into sections. Preserve contributing sources so filtering still finds merged cards.
Add explicit empty/failure states and local API support for development.

Keep the existing React/Vite application and response shape. All filtering runs
in the browser against the fetched collection. The backend remains responsible
for feed collection, normalization, deduplication, and sorting.

## Technical Context

**Language/Version:** JavaScript ES modules and JSX; observed Node 22.16.0.
Use Node 22.13+ within the 22.x line for this implementation, satisfying the
Vite and ESLint requirements recorded in `package-lock.json`.

**Primary Dependencies:** Existing React 19, Vite 8, Axios, rss-parser 3, ESLint 10.
Retain locked versions; no new runtime or test framework is required by this plan.

**Storage:** In-memory response and React state only.
**Testing:** Node's built-in test runner for pure logic/API checks; fixture-backed
browser checks for interactions and layout. No automated UI framework in R1.
**Target Platform:** Modern desktop/mobile browsers, Windows development, current
Vercel-style Node handler for production. Deployment environment is not verified.
**Project Type:** Small web application with one server endpoint.
**Performance Goals:** Up to 75 input articles, at most 75 output cards; filter
interaction target under 200ms in the defined local check; no filtering requests.
**Constraints:** Preserve response keys, source choices, partial-feed handling,
article attribution, and plain-text descriptions; avoid paid infrastructure.
**Scale/Scope:** One page, four reader stories; no database or new source adapters.

## Constitution Check

| Principle | Before design | After design |
| --- | --- | --- |
| Useful access | Preserve the source policy | No paid sources restored; no free-access guarantees added |
| Reuse application | Existing dependencies and folders | Add small helpers/components; no framework or storage replacement |
| Understandable failures | Keep successful feeds | Four empty/error states and source failure checks specified |
| Reviewable releases | Bounded R1 | Requirements map to tasks and focused validation |

Both design reviews pass against [project principles](../../.specify/memory/constitution.md).
These are planning checks, not evidence that application tests have passed.

## Project Structure

### Documentation

```text
.specify/memory/constitution.md
specs/roadmap.md
specs/001-news-discovery/
  spec.md
  plan.md
  research.md
  data-model.md
  contracts/news-discovery.md
  quickstart.md
  tasks.md
  checklists/requirements.md
```

### Planned application changes

```text
api/ai-news.js                      thin handler; default live export
server/news-service.js              reusable aggregation with injected feed reader
server/sources.js                   existing source list, preserving order
server/article-utils.js             canonical URLs, stable IDs, merge/sort
scripts/vite-news-api.js            development middleware and fixture selection
src/App.jsx                        response/filter state and derived sections
src/lib/filter-news.js             pure query/source/category/date matching
src/lib/news-response.js            response validation and error-state selection
src/components/NewsFilters.jsx      labeled search and select controls
src/components/NewsSection.jsx      counts, empty message, provenance, source links
src/components/RssSources.jsx       existing directory and failure display
src/styles/App.css                 responsive controls/focus/empty states
tests/fixtures/news-fixtures.js     synthetic parsed feeds and scenarios
tests/*.test.js                    targeted Node test suites
vite.config.js                     register development middleware
eslint.config.js                   appropriate Node/browser globals
package.json                       test script; existing dev/build scripts
README.md                          actual local workflow and limits
```

**Structure decision:** Keep application folders intact. Put server helpers outside
`api/` so they do not become extra deployment endpoints. React imports only client
helpers, never RSS parsing or fixture modules.

## Data flow and integration

1. Move the 15-source list into `server/sources.js` without changing names, URLs,
   or ordering. Extract current collection into `collectNews({ sources, parseFeed })`.
2. `api/ai-news.js` exports a default live handler plus a handler factory for
   dependency injection in tests/development. Production always uses the live reader.
3. For each feed, retain its first five entries, normalize eligible links/dates,
   shorten descriptions, and retain existing keyword behavior.
4. Merge matching canonical URLs across all sources. Pick one complete representative
   article, union source names, and OR keyword flags. Sort and split once globally.
5. `App` validates the response, records the accepted-response clock, and stores it.
   Filter state is separate; derive visible sections rather than copying posts
   into more state. The directory always receives the complete source list.
6. Source matching uses `sourceNames`, with `[source]` fallback for old cached
   responses. Search uses those same names. Result counts are computed after all filters.
7. Request cleanup uses cancellation and a stale-request guard. A cancellation
   caused by cleanup must not show an error. Handle React Strict Mode correctly.

See [data model](data-model.md) for normalization and
[contract](contracts/news-discovery.md) for exact UI/API behavior.

## Local development

Use a Vite development plugin with `configureServer` to intercept exactly
`/api/ai-news` before HTML fallback. Adapt Node's response to the handler's small
`setHeader`, `status`, and `json` interface; catch unexpected exceptions as JSON.
Other paths pass through untouched. `npm run dev` serves both app and live API.
Server-side edits can require restarting Vite; document this rather than creating
a second hot-reload process.

The plugin alone reads `NEWS_FIXTURE=normal|large|empty|partial|failed|request-error` and
injects synthetic feed results. No URL parameter or production environment switch
can activate fixtures. Fixture mode makes no publisher requests. It is excluded
from client code and production handler imports. Dates are generated relative to
the fixture clock; unit checks explicitly supply a fixed clock.

## Validation and delivery

Write focused failing checks before each new transformation. Test URL collisions,
source provenance, exact cutoff boundaries, response compatibility, method/error
handling, and fixture isolation. Run `npm test`, `npm run lint`, and `npm run build`.
Complete browser scenarios in [quickstart.md](quickstart.md), including 75-card
performance and keyboard/mobile checks. Live RSS is a smoke check, not a deterministic
acceptance dependency. Record any publisher failures separately.

Deploy the API additions before or with the UI; old response fields remain and
the UI accepts old cached articles. Rollback is the previous frontend/API artifact;
there are no migrations. Production deployment is not part of this planning task.

## Risks and mitigations

- Conservative URL matching misses redirects/aliases: acceptable in R1; do not
  fetch every destination or merge based on titles.
- Source filtering after merging can lose attribution: retain `sourceNames` and test it.
- Cached responses can be old: recent filters may be empty; do not imply historical
  search or a live freshness guarantee. Freshness controls belong to R3.
- Publisher delays remain dependent on the current parser/network settings;
  explicit per-source timeout policy is scheduled for R3.
- Detailed topic quality is unchanged until R2; label R1 controls as categories.

## Complexity Tracking

No constitution violations. The local adapter and injected reader are required
to test the existing serverless-style endpoint without extra infrastructure.
