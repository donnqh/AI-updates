# Tasks: News discovery

**Input:** [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md),
[data-model.md](data-model.md), and [contract](contracts/news-discovery.md).
**Status:** Planned; all implementation tasks are unchecked.
**Tests:** Focused automated tests explicitly included by this feature spec.
Paths below are relative to `AI-updates/`. User story labels map to the spec.

## Phase 1: Setup

- [ ] T001 Confirm Node 22.x >=22.13, install the current lockfile dependencies, run baseline build/lint, and record existing failures in `specs/001-news-discovery/quickstart.md`; preserve prior `api/ai-news.js` source changes.
- [ ] T002 Add `test: node --test` in `package.json` and scope Node/browser globals correctly in `eslint.config.js` for `api/`, `server/`, `scripts/`, `tests/`, and `src/`; resolve touched baseline lint issues without disabling rules globally.
- [ ] T003 Define injectable parsed-feed fixtures in `tests/fixtures/news-fixtures.js` for normal, large, empty, partial, failed, and request-error scenarios, using the exact cases/counts and clock rules in `specs/001-news-discovery/quickstart.md`.

## Phase 2: Foundation

- [ ] T004 Add failing compatibility checks in `tests/news-api.test.js` for current four response keys, section text, source list, first-five limit, and partial failures, using the fixture reader instead of the network.
- [ ] T005 Extract the unchanged 15-source list into `server/sources.js` and existing collection into `server/news-service.js`; expose `collectNews({ sources, parseFeed })` and a factory in `api/ai-news.js`, retaining its default live handler and making T004 pass.
- [ ] T006 Add failing local-route checks in `tests/dev-api.test.js` for exact pathname handling, GET/405 behavior, JSON errors, fixture isolation, invalid fixture names, and pass-through of unrelated paths.
- [ ] T007 Implement the Vite response adapter and development-only fixture reader in `scripts/vite-news-api.js`, register it in `vite.config.js`, and handle GET/405/unexpected 500 behavior consistently in `api/ai-news.js` per `specs/001-news-discovery/contracts/news-discovery.md`.

**Checkpoint:** Live and offline-fixture local API paths work with the existing UI.

## Phase 3: US1 - Search loaded articles (P1)

- [ ] T008 [US1] Add failing search checks in `tests/filter-news.test.js` for case, trimmed whitespace, literal punctuation, title/description/source matches, empty query, and immutable inputs.
- [ ] T009 [US1] Implement pure search matching in `src/lib/filter-news.js`, including `sourceNames` with legacy `[source]` fallback; `query` is an empty string by default and is treated literally.
- [ ] T010 [US1] Add the labeled query control in `src/components/NewsFilters.jsx` and query state/derived section results in `src/App.jsx`; never fetch in response to typing, and retain complete directory data.
- [ ] T011 [US1] Add total/section counts and filtered-empty feedback in `src/App.jsx` and `src/components/NewsSection.jsx`; verify US1 independently and record results in `specs/001-news-discovery/quickstart.md`.

**Checkpoint:** Search alone works on existing or legacy payloads.

## Phase 4: US2 - Source/category/date filters (P1)

- [ ] T012 [US2] Extend `tests/filter-news.test.js` with AND combinations, provenance membership, category choices, exact cutoff inclusion, one-millisecond exclusion, invalid/future dates, All time, and reset defaults.
- [ ] T013 [US2] Extend `src/lib/filter-news.js` with `source` empty for All sources or one configured name, `category` one of `all|related|other`, and `dateRange` one of `all|24h|7d|30d`; defaults are `all`, and require `referenceTime - duration <= publicationTime <= referenceTime` for bounded dates.
- [ ] T014 [US2] Add three labeled selectors and Clear filters to `src/components/NewsFilters.jsx`; wire separate filter state and accepted-response referenceTime in `src/App.jsx`, hide unselected category sections/navigation, and preserve the full source directory.
- [ ] T015 [US2] Verify combined controls and result counts using the fixed fixture expectations and browser scenarios in `specs/001-news-discovery/quickstart.md`; source choices include failed configured sources.

**Checkpoint:** Search is optional; all three filters work with an empty query.

## Phase 5: US3 - Stable identities and duplicate removal (P2)

- [ ] T016 [US3] Add failing normalization/deduplication checks in `tests/article-utils.test.js` for tracking/fragment equivalence, meaningful query differences, preserved path/scheme/host aliases, bad links, date fallback, representative selection, source union, category OR, ordering, and stable IDs after feed reordering.
- [ ] T017 [US3] Implement URL/date normalization in `server/article-utils.js`: eligible absolute HTTP(S) links only, reject missing/fragment-only/credential-bearing links, remove fragment and only `utm_*|fbclid|gclid` from canonical URLs; `id` equals `canonicalUrl`, and `date` is ISO UTC or `No date`.
- [ ] T018 [US3] Implement canonical grouping and deterministic sorting in `server/article-utils.js` and apply it before splitting in `server/news-service.js`; newest valid representative wins, ties use source order then item index, `sourceNames` is non-empty/unique/configuration-ordered, and keyword flags combine with OR.
- [ ] T019 [US3] Extend `tests/news-api.test.js` for global deduplication before section splitting, no repeated IDs, retained source directory, unchanged first-five-before-merge limit, and source-filter matching of merged results through `src/lib/filter-news.js`.
- [ ] T020 [US3] Display contributing sources and use real safe source anchors in `src/components/NewsSection.jsx`; verify ten normal-fixture cards, preserved same-title/different-URL articles, and legacy fallback using `specs/001-news-discovery/quickstart.md`.

**Checkpoint:** Duplicates disappear with all filters cleared; each contributing
source still finds the merged card when filters are used.

## Phase 6: US4 - Understandable states and accessible controls (P2)

- [ ] T021 [US4] Add failing validation/state-selection checks in `tests/news-response.test.js` for malformed payloads, legacy optional fields, loading/request error, all-source failure, successful empty feeds, partial failure, and filtered-empty precedence.
- [ ] T022 [US4] Implement response validation and state selection in `src/lib/news-response.js`; retain required array/section shapes, validate article display strings, HTTP(S) links, string IDs, and boolean classification per the contract, accept legacy absence of new provenance fields, and treat invalid date strings as unknown.
- [ ] T023 [US4] Wire explicit state messages and atomic response/referenceTime updates in `src/App.jsx`; add lifecycle cancellation/stale-response protection and ignore cleanup cancellations; keep the directory and partial warnings visible after valid responses.
- [ ] T024 [US4] Update `src/components/NewsFilters.jsx`, `src/components/NewsSection.jsx`, and `src/styles/App.css` for accessible labels, polite counts, visible focus, wrapping controls, safe long-link wrapping, and usable layouts at 360px/1280px.
- [ ] T025 [US4] Add all-feeds-failed no-store and unexpected-error checks to `tests/news-api.test.js`, implement the cache behavior in `api/ai-news.js`, and exercise fixture failure/accessibility scenarios in `specs/001-news-discovery/quickstart.md`.

**Checkpoint:** Each failure/empty situation is distinguishable, and reading works
with keyboard navigation and mobile-width controls.

## Phase 7: Release validation and documentation

- [ ] T026 Run `npm test`, `npm run lint`, and `npm run build` from `package.json`; fix new failures and record outputs/limits in `specs/001-news-discovery/quickstart.md`.
- [ ] T027 Complete the full normal/large/failure fixture browser checks, verify no filter-triggered network calls, measure 20 interactions on 75 cards, and inspect production fixture exclusion; record evidence in `specs/001-news-discovery/quickstart.md`.
- [ ] T028 Replace starter instructions in `README.md` with actual dev/live/fixture/check commands and static-preview limits; update `docs/news-sources.md` to point to `server/sources.js` and explain deduplication and the first-five limit.
- [ ] T029 Reconcile all design documents in `specs/001-news-discovery/` against delivered behavior; run the local Spec Kit prerequisite check and record acceptance status in `specs/001-news-discovery/checklists/requirements.md`.

## Dependencies and execution order

Setup T001-T003 -> foundation T004-T007 -> reader stories -> validation T026-T029.
Within each story, write the focused failing checks before its implementation.
US1 and US2 can each be demonstrated with legacy payloads; US3 can be verified
through the API alone; US4 can be demonstrated with fixtures and no active filters.
US2 extends the same helper and control files as US1, so implement them sequentially.
US3 backend work does not require the filters, but T019 verifies their integration.
UI polish comes after the controls exist. There are no `[P]` task markers because
this small release shares files heavily; no parallel agent execution is assumed.

## Requirement coverage

| Requirement | Tasks |
| --- | --- |
| FR-001 | T008-T011 |
| FR-002, FR-003, FR-004 | T012-T015, T019 |
| FR-005 | T010-T015, T027 |
| FR-006, FR-007 | T016-T020 |
| FR-008 | T004-T005, T019-T020, T025, T028 |
| FR-009 | T018, T021-T025 |
| FR-010 | T024, T027 |
| FR-011 | T001-T007, T026-T028 |
| FR-012 | T023, T027 |

## Delivery strategy

The smallest useful increment is foundation plus US1 search. The intended first
release includes all four stories and release validation. Complete tasks only
after their evidence exists; deployment and later roadmap releases are separate work.
