# Feature Specification: News discovery

**Feature ID:** `001-news-discovery`
**Git branch at planning:** `main` (no feature branch created)
**Created:** 2026-09-12
**Status:** Draft, ready for implementation; not implemented
**Input:** Make AI Updates easier to search and filter, remove duplicate articles,
and plan all further upgrades in a phased roadmap.

## User Scenarios & Testing

### User Story 1 - Find articles by text (Priority: P1)

As a reader, I can search loaded headlines and descriptions to find a tool or
subject without scanning every card.

**Why this priority:** Immediate value within the existing article list.
**Independent test:** Search known articles with all other filters set to All;
no classification or deduplication changes are needed to demonstrate this story.

**Acceptance scenarios:**

1. Given articles mentioning Claude and Gemini, when I type ` claude `, then only
   articles whose title, displayed description, or source names contain `claude`
   appear, regardless of letter case.
2. Given an active search, when I clear it, then all articles allowed by other
   filters return without a new news request.
3. Given no matches, then the page shows zero results and Clear filters, while
   the source directory stays visible.

### User Story 2 - Narrow by source, category, and age (Priority: P1)

As a reader, I can combine source, category, and date choices to find relevant news.

**Why this priority:** Makes the limited collection useful without more sources.
**Independent test:** With an empty search, change each filter and combine them.

**Acceptance scenarios:**

1. Given several sources, when I select one, then only articles associated with
   it appear; the directory still lists every configured source.
2. When I select AI & Developer News or Other Tech News, only that section is
   shown. All categories shows both sections.
3. Given a fixed reference time, Past 24 hours, Past 7 days, and Past 30 days
   include articles between the inclusive cutoff and reference time. Missing,
   invalid, and future dates do not match these ranges.
4. Given search and three active filters, every visible article satisfies all
   four controls. Clear filters resets all four together.

### User Story 3 - Read each article once (Priority: P2)

As a reader, I see one card when two feeds link to the same article and can still
find it through either source.

**Why this priority:** Reduces repetition and establishes identities for bookmarks.
**Independent test:** Aggregate repeated and distinct URLs without UI filtering.

**Acceptance scenarios:**

1. Given the same URL with different tracking parameters or fragments, one card
   appears and retains all contributing source names.
2. Given different URLs with identical titles, both remain. Different reporting
   of the same story is not a duplicate.
3. Given the same articles in a different feed item order, each canonical URL
   keeps the same article ID after reload.
4. Missing or unsafe links are omitted; unrelated items never collapse into
   one placeholder-link article.

### User Story 4 - Understand results and failures on any screen (Priority: P2)

As a reader, I can operate controls on a phone or keyboard and understand why
the list is empty.

**Why this priority:** Keeps discovery usable and avoids misleading empty screens.
**Independent test:** Use complete, empty, partial-failure, and total-failure responses.

**Acceptance scenarios:**

1. When some feeds fail, successful articles remain readable and the directory
   identifies failed feeds.
2. When every feed fails, the page reports unavailable news sources rather than
   suggesting the search has no matches.
3. A successful response with no items and no failed feeds says no articles are
   available. A failed HTTP request has a separate request-error message.
4. At 360px width or with keyboard-only navigation, every control has an accessible
   name, visible focus, and works without horizontal page scrolling.

### Edge Cases

- Whitespace-only search means no search; punctuation is literal, not regex.
- An unavailable selected source yields zero matches and retains its failure status.
- A duplicate in both categories belongs to AI & Developer News if any member
  matches the current keywords, and appears in only one section.
- Invalid dates sort last in All time; future dates remain visible in All time.
- A valid empty feed is not marked failed.
- Filters cover only the loaded response, not a publisher's full archive.

## Requirements

### Functional Requirements

- **FR-001:** Case-insensitive literal substring search covers title, displayed
  description, and contributing source names; trim surrounding query whitespace.
- **FR-002:** One source selector defaults to All sources and matches all
  contributing sources of a deduplicated article.
- **FR-003:** Categories are All categories, AI & Developer News, and Other Tech
  News. Detailed multi-topic classification belongs to R2.
- **FR-004:** Date options are All time (default), Past 24 hours, Past 7 days, and
  Past 30 days, using the inclusive rolling boundaries in US2.
- **FR-005:** Combine controls with AND without network calls; provide Clear
  filters and visible total and per-section result counts.
- **FR-006:** Deduplicate valid destinations by canonical URL before section
  splitting; preserve all contributing source names.
- **FR-007:** Stable IDs derive from canonical URLs; never deduplicate by title.
- **FR-008:** Preserve current response keys, attribution, links, directory,
  partial-failure behavior, and source-list edits already in the working tree.
- **FR-009:** Sort deterministically newest first, invalid dates last; distinguish
  filtered-empty, source-empty, all-feeds-failed, and request-failed states.
- **FR-010:** Controls are labeled, keyboard-operable, and usable at 360px width;
  announce count changes politely without moving focus.
- **FR-011:** Run frontend and news endpoint together locally, with deterministic
  fixture mode for acceptance checks.
- **FR-012:** Abort requests on lifecycle cleanup and prevent old responses from
  overwriting newer state. Filtering must not trigger fetches.

### Key Entities

- **Article:** Stable identity, title, description, destination, publication date,
  category membership, and contributing sources.
- **Source:** Configured feed and its request success/failure.
- **Filter selection:** Query, one source, one category, and one date window.
- **News result:** Two sections, complete source directory, and failures.

## Success Criteria

- **SC-001:** Deterministic filter examples produce exactly the expected IDs/counts.
- **SC-002:** Each canonical URL produces one card; different URLs sharing a title
  remain separate; every contributing source can find the merged card.
- **SC-003:** On the implementation machine, 20 consecutive filter interactions
  with 75 fixture articles each visibly settle within 200ms; record browser and
  machine context. Filtering produces zero additional news requests.
- **SC-004:** All four empty/failure situations show their specified messages and
  retain the source directory where a valid response exists.
- **SC-005:** Search, filtering, clearing, and opening articles work at 360px and
  1280px widths and with keyboard navigation.
- **SC-006:** One documented local start command serves page and JSON endpoint;
  offline fixture mode validates the same reading experience.

## Assumptions and Scope

- Anonymous reading; filters reset on reload in R1.
- Search covers available descriptions, not full article bodies.
- First five entries per source remain the limit before deduplication.
- Existing keywords remain until R2. The date reference clock is captured when
  a response is accepted, rather than advanced by a timer.
- No subscriptions, database, accounts, summaries, scraping, bookmarks, stored
  preferences, scheduling, or automatic paywall detection in R1.
- This specification requests focused automated checks for normalization,
  deduplication, filter boundaries, API compatibility, and failure behavior.
  Browser acceptance checks cover interaction, accessibility, and layout.
