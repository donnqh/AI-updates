# Design decisions: News discovery

**Date:** 2026-09-12. Local code is the baseline; documentation below was checked
for implementation feasibility. No implementation benchmarks were run.

## 1. Adopt the local Spec Kit workflow

**Decision:** Use the sibling checkout's spec/plan/tasks templates and PowerShell
setup scripts. Keep feature state in `.specify/feature.json` and leave Git on main.
**Rationale:** The user requested this local toolkit and planning artifacts. Its
[existing-project guide](../../../spec-kit/docs/guides/existing-projects.md) supports
starting with a bounded change rather than reconstructing the application.
**Alternatives:** Full CLI/integration installation introduces unrelated setup.
Branch automation is optional in this checkout and not needed to draft the plan.

## 2. Filter in the browser

**Decision:** Pure filtering of the fetched collection, using existing React state.
**Rationale:** The code limits collection to 75 entries; server search would add
requests without expanding available history. Derived results avoid synchronization bugs.
**Alternatives:** Search service, database queries, and a state-management package
are unnecessary for this scope. Revisit with stored history in R5.

## 3. Conservative canonical URLs and source provenance

**Decision:** Deduplicate by parsed HTTP(S) URLs after removing fragments and only
known tracking parameters. Preserve meaningful query parameters, path case,
trailing slashes, scheme, and host aliases. Use the canonical URL string as ID.
Union source names and preserve one representative article's attribution.
**Rationale:** Existing source-index IDs change when feed ordering changes.
Title matching could wrongly collapse distinct reporting. URL strings need no
hash library and are adequate React keys for this collection size.
**Alternatives:** Destination crawling, fuzzy titles, and semantic clustering add
latency or false merges. Handle cross-URL story grouping in R6.

## 4. Categories now; better topics later

**Decision:** R1 filters the two existing sections. R2 introduces richer topic rules.
**Rationale:** Current classification searches titles, shortened descriptions, and
source names for broad keywords. Correcting this deserves labeled examples and
separate acceptance criteria; it is not solved by adding a dropdown.
**Alternatives:** LLM classification would introduce cost and variability.

## 5. One local server command

**Decision:** A Vite development plugin calls the same handler through a small
response adapter. Its fixture reader is injected only in development.
**Rationale:** `vite.config.js` currently has no API middleware. Vite documents
custom request middleware through
[`configureServer`](https://vite.dev/guide/api-plugin.html#configureserver).
**Alternatives:** A second Express server duplicates lifecycle setup; a hosting CLI
adds installation requirements. A frontend-only mock would not exercise the API.

## 6. Focused tests without a new framework

**Decision:** Use `node:test` and `node:assert/strict` for transformations and handler
contracts, with manual fixture-backed browser validation for JSX interactions.
**Rationale:** The observed Node version already provides a
[stable built-in test runner](https://nodejs.org/download/release/v22.16.0/docs/api/test.html).
Dependency injection avoids experimental module mocking and external feed reliance.
**Alternatives:** Vitest/Playwright can be considered when automated UI coverage
justifies their setup; a pure snapshot suite would miss key edge cases.

## 7. Keep RSS collection settings separate from discovery

**Decision:** Preserve five entries per feed and current cache behavior for usable
responses. Explicit timeouts/retries and refresh scheduling belong to R3.
**Rationale:** The current project uses `rss-parser`; its
[documentation](https://github.com/rbren/rss-parser) supports URL parsing and
configurable requests, but collection policy is separate from search behavior.
**Alternatives:** Replacing ingestion in R1 would broaden the release unnecessarily.

## Resolved assumptions

One source selector; current two categories; rolling 24-hour/7-day/30-day windows;
no persistent filters; no full-text search; invalid dates last; future dates only
in All time; URL deduplication rather than story grouping. All R1 design decisions
are specified. Later provider/budget decisions remain in the roadmap.
