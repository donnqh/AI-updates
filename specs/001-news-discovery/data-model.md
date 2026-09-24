# Data model: News discovery

## Source

Keep `{ name, url }`, with unique names and feed URLs. The order of the 15-source
configuration is deterministic. Moving the list must preserve its current contents.
`FailedFeed` retains `{ source, error }`, where `source` matches a configured name.

## Article

| Field | Rule |
| --- | --- |
| `id` | Non-empty string equal to canonicalUrl; stable across feed reordering |
| `canonicalUrl` | Absolute HTTP(S) URL after the normalization below; new field |
| `title` | Non-empty display string, fallback `No title` |
| `message` | Existing plain-text feed description, at most 180 characters plus `...`; fallback `No summary available.` |
| `source` | Representative article's configured source name; existing field |
| `sourceNames` | Non-empty unique array of contributing source names, in configured source order; new field |
| `date` | ISO 8601 UTC string if parseable, otherwise existing sentinel `No date` |
| `link` | Representative article's absolute HTTP(S) destination; may retain tracking or fragment |
| `isKeywordRelated` | Boolean; true when any duplicate member matches existing keywords |

Publication date uses the first valid candidate from `pubDate`, then `isoDate`.
Descriptions that become empty after stripping tags/whitespace use the fallback.
Do not render description HTML or manufacture text from an inaccessible article.

## URL eligibility and normalization

1. Require a non-empty trimmed string. Skip missing, fragment-only, unparsable,
   non-HTTP(S), or credential-bearing URLs. Do not convert `#` into a feed URL.
2. Resolve other relative links against the feed URL with the standard URL parser.
3. Preserve the resolved original as `link`; derive a separate canonical URL.
4. Clear its fragment. Remove parameters whose names start with `utm_`, or equal
   `fbclid` or `gclid`, case-insensitively.
5. Preserve all remaining query names, values, and ordering; do not strip unknown
   parameters, change path case/trailing slash, force HTTPS, remove `www`, or follow redirects.
6. Use the parser's serialized URL as `canonicalUrl` and `id`. Its normal hostname
   casing/default-port normalization is accepted.

Examples: `https://example.org/a?utm_source=x#top` and
`https://example.org/a?utm_source=y` merge. `/a?id=1` and `/a?id=2` do not.
Neither do `http://example.org/a` and `https://example.org/a`, or `/a` and `/a/`.

## Duplicate grouping and ordering

Group by canonicalUrl after the first-five limit for each feed. Select the
representative with the newest valid date; a valid date beats an invalid date.
Break equal/invalid-date ties by configured source order, then original item index.
Retain that member's title, description, source, date, and original link together.
Merge only `sourceNames` and `isKeywordRelated` across group members.

Sort resulting articles by valid date descending, invalid dates last, then
canonicalUrl using deterministic lexical order. Split by the merged keyword flag.
Each ID belongs to one section. Equal titles are never a grouping key.

## Filter state

| Field | Default and allowed values |
| --- | --- |
| `query` | Empty string; free text treated literally |
| `source` | Empty string for All sources, otherwise one configured source name |
| `category` | `all`, `related`, or `other`; default `all` |
| `dateRange` | `all`, `24h`, `7d`, or `30d`; default `all` |
| `referenceTime` | Milliseconds since epoch, captured when a successful response is accepted |

Query matching lowercases the trimmed query and checks the concatenated title,
message, and contributing source names. Source matching checks array membership;
older cached articles without `sourceNames` fall back to `[source]`.

Date windows are rolling elapsed durations: 24, 168, or 720 hours.
Require `referenceTime - duration <= publicationTime <= referenceTime`.
All time imposes no date restriction. Search/source/category/date predicates
combine with AND and preserve the server's ordering. Derived results never mutate
the original response; controls reset on reload.

## Request and result state

`loading -> ready | request-error`. Cleanup cancels the request; stale completions
cannot update current state. On a valid response, store the full response and
referenceTime atomically. A later accepted response replaces both and retains
current filter selections; explicit Clear filters resets only filters.

Within ready: zero unfiltered articles plus every configured source failed means
`sources-unavailable`; zero with some successful sources means `source-empty`;
nonzero unfiltered but zero filtered means `filter-empty`; otherwise show results.
Partial failures display alongside whichever valid result state applies.
