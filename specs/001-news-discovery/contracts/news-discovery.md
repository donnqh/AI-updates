# API and UI contract: News discovery

## GET /api/ai-news

No filter query parameters are added. Browser filters use the returned collection.
The existing top-level fields and section labels remain:

```json
{
  "rssFeeds": [{ "name": "Example", "url": "https://example.org/feed" }],
  "keywordRelatedNews": {
    "title": "AI & Developer News",
    "description": "Articles that are more relevant to AI, tools, models, and developer productivity.",
    "posts": [{
      "id": "https://example.org/claude",
      "canonicalUrl": "https://example.org/claude",
      "title": "Claude update",
      "message": "A short description from the feed.",
      "source": "Example",
      "sourceNames": ["Example"],
      "date": "2026-09-12T03:00:00.000Z",
      "link": "https://example.org/claude?utm_source=feed",
      "isKeywordRelated": true
    }]
  },
  "otherTechNews": {
    "title": "Other Tech News",
    "description": "General technology updates from the same RSS sources.",
    "posts": []
  },
  "failedFeeds": []
}
```

This example is illustrative. The actual source list remains the 15 configured
sources. Normalization, representative selection, and ordering follow
[data-model.md](../data-model.md).

### Compatibility and failure behavior

- Existing fields remain; `canonicalUrl` and `sourceNames` are additive.
- Article IDs change from positional strings to canonical URLs. Nothing currently
  persists them; future bookmarks must use the new identity.
- UI accepts a legacy cached response without the two new fields. It uses `source`
  for provenance and the existing `id` as a rendering fallback.
- Partial and all-source failures remain HTTP 200 with `failedFeeds`, and successful
  empty feeds remain valid successes. All-source failures use `Cache-Control: no-store`.
- Usable live results retain `s-maxage=900, stale-while-revalidate=3600`.
  Development fixture responses always use `no-store`.
- Unsupported methods return HTTP 405 with `Allow: GET`; unexpected handler errors
  return HTTP 500 and `{ "error": "Unable to fetch news right now." }`, with no-store.
- Missing/malformed required sections, posts arrays, or source/failure arrays are
  request errors in the frontend, rather than an uncaught rendering exception.
- Runtime validation also checks each article's display strings, HTTP(S) link,
  boolean classification, and string ID; `date` may be an invalid string and is
  treated as unknown by the filter. Optional provenance fields are validated when present.

## UI controls

Controls appear above the article sections: Search articles, Source, Category,
Published, and Clear filters. Search helper text says "Search loaded articles".
Defaults and matching behavior follow the data model. Source options come from
the complete directory, including currently failed sources.

Show `Showing X of Y articles`, where Y is the unfiltered unique collection size
and X is the size after all filters. Show each visible section's result count.
Changing controls causes no navigation, fetch, or focus movement. Count updates
use a polite live region. Clear filters is a button.

Render source provenance as readable names. Article destinations are real links
with `target="_blank"` and `rel="noopener noreferrer"`, allowing standard browser
link actions and keyboard access.

## State precedence

1. Loading: existing loading presentation.
2. Request failed or invalid response: request-error message; no filter-empty claim.
3. Every source failed: "News sources could not be loaded." and failed directory.
4. No unfiltered articles with some successful sources: "No articles are available
   from the sources right now." and any partial-failure warning.
5. Unfiltered articles exist but filtered total is zero: "No articles match your
   filters." and Clear filters.
6. Otherwise show results; a visible section with zero matches gets a short
   section-level empty message. Partial source warnings remain in the directory.

The directory is never filtered. When a category is selected, hide the other
section and its navigation anchor; restore both when All categories is selected.

## Development-only fixture interface

`NEWS_FIXTURE` selects `normal`, `large`, `empty`, `partial`, `failed`, or `request-error`
when starting Vite. Any other non-empty value fails startup with a clear message.
This is read only by development middleware; the production handler does not
import fixtures or inspect this variable. URLs cannot select fixture data.

Large contains 15 synthetic sources with five unique articles each (75 total).
Normal includes both categories, repeated destinations, distinct same-title URLs,
missing/invalid dates, and multiple sources. Empty has successful feeds with no
items; partial has one failed source; failed rejects every source; request-error
forces a development-only HTTP 500. Unit tests inject a fixed clock; browser
fixtures generate relative dates so tests remain useful after this document's date.
