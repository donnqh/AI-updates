# AI Updates upgrade roadmap

**Date:** 2026-09-12
**Status:** Proposed implementation sequence; first release specified in detail.
**User direction:** A phased roadmap for all upgrades, with a detailed first release.

## Starting point

The app fetches up to five entries from each of 15 sources, splits them using
keywords, and renders two article sections and an RSS directory. Source changes
already in the working tree remove four publishers with paid content and add four
public company/research feeds. Preserve them; see [source selection](../docs/news-sources.md).

There is no database, search, source filtering, deduplication, saved reading list,
scheduled ingestion, or local API wiring. The README is still a starter template.

## Release sequence

| Release | Reader outcome | Main work | Completion evidence |
| --- | --- | --- | --- |
| 1. Find useful articles | Locate articles quickly and see each article once | Search; source, current-category, and date filters; URL deduplication; stable article IDs; clear empty states; mobile-friendly controls; local API setup | [R1 scenarios](001-news-discovery/spec.md) and [validation guide](001-news-discovery/quickstart.md) pass |
| 2. Improve relevance and access | Understand topics and avoid known paid destinations | Multi-topic rules for AI Models, Coding Tools, Research, Industry News, and Other; classify full available feed text; known paid-domain filtering of direct article links; honest access labels | Labeled examples produce expected topics; blocked destinations disappear even through aggregators; unknown access is never labeled verified free |
| 3. Add sources and reliable refresh | Read more sources and understand freshness | Shared source configuration; RSS/API adapters; one selected permitted public-page adapter; manual refresh and retry; last successful fetch time; per-source timeouts and health details | Adapters pass a common output contract; failures preserve other sources; refresh requests cannot overlap indefinitely; cached data retains its original fetched time |
| 4. Personal reading | Return to saved stories and preferred sources | Browser-local bookmarks; saved source choices; read/unread status; reset controls; mobile card/layout refinement | Preferences survive reload; old bookmarks remain available after leaving feeds; storage failures do not crash reading |
| 5. Stored news and scheduled collection | Browse history and load without waiting for publishers | Article/source storage; scheduled collector; separate read endpoint; retention; pagination; deduplication across runs; operational status | Repeated jobs are idempotent; failed jobs preserve previous articles; retention and pagination work; read requests do not fetch publishers |
| 6. Optional summaries and story grouping | Understand articles quickly and compare coverage | Summaries from permitted accessible text; generated-summary labels; original links; cost limits; grouping different URLs covering the same event | Summaries checked against source text; unavailable text gets no invented summary; spending bounded; distinct events are not merged |

## Dependencies and boundaries

- R1 provides stable IDs and source provenance needed by bookmarks and storage.
- R2 builds on R1 normalization. Its topics replace the coarse category control,
  keeping old API categories during a transition.
- R3 reuses normalization. Start with one non-RSS provider, not a universal
  scraper or an arbitrary user-supplied URL fetcher.
- R4 requires R1 stable IDs and can precede R3 if personalization becomes the priority.
- R5 follows R3 so collection jobs reuse its adapters.
- R6 follows R5 for reusable text, cached results, and enforceable budgets.
  URL deduplication in R1 is separate from semantic story grouping in R6.

## Decisions deferred to their releases

| Release | Decision to resolve in its own specification |
| --- | --- |
| R2 | Domain list, article metadata signals, mixed free/paid publishers, and a labeled topic evaluation set |
| R3 | First non-RSS provider, permitted access, refresh rate limits, and any third-party feed service costs |
| R4 | Bookmark limit and source preferences; accounts and cross-device sync are outside this roadmap |
| R5 | Hosting/database provider, budget, collection frequency, retention, and expected traffic |
| R6 | Summary provider/model, content permissions, length, evaluation set, and monthly spending cap |

These later decisions do not block R1. No provider purchases or migrations are
needed for R1.

## First release package

- [Requirements and user stories](001-news-discovery/spec.md)
- [Implementation plan](001-news-discovery/plan.md)
- [Design decisions](001-news-discovery/research.md)
- [Data model](001-news-discovery/data-model.md)
- [API and UI contract](001-news-discovery/contracts/news-discovery.md)
- [Implementation tasks](001-news-discovery/tasks.md)
- [Validation guide](001-news-discovery/quickstart.md)
- [Planning review](001-news-discovery/checklists/requirements.md)

Use each release's completion evidence before starting the next. This roadmap
sets order and scope rather than promising dates without an implementation estimate.
