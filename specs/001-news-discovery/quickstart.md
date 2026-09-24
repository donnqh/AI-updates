# Validation guide: News discovery

**Status:** Commands and scenarios below are the implementation target. The test
script, middleware, and fixtures do not exist yet. This planning turn has not run them.

## Prerequisites

- Work from `AI-updates/` in PowerShell.
- Node 22.x, at least 22.13, and npm. Planning observed Node 22.16.0.
- Install the existing lockfile dependencies with `npm ci` during implementation.
  Initial installation needs network access; fixture checks then work offline.
- No publisher accounts, paid API keys, or database are required for R1.

## Automated checks after implementation

```powershell
npm test
npm run lint
npm run build
```

Expected: Node transformation/handler checks, ESLint, and production build pass.
The tests use injected parsed-feed fixtures, never public RSS requests. Confirm
fixtures are absent from client assets and the production handler's import graph.

## Deterministic reading scenario

```powershell
$env:NEWS_FIXTURE = 'normal'
npm run dev
```

Open the localhost URL Vite prints. The middleware must return JSON at
`/api/ai-news`; the browser must display both categories and the source directory.
Dates below are relative to the injected fixture clock; unit checks use fixed
`2026-09-12T04:00:00.000Z`. Use generated current dates for the browser, avoiding
reliance on historic document dates.

The normal fixture uses synthetic sources A, B, and C. Feed A has five inputs,
B has five, and C has three; never exceed the first-five rule.

| Input | Source | Destination suffix on https://example.org | Age / category |
| --- | --- | --- | --- |
| Claude update | A | /claude?utm_source=a#top | 1 hour / related |
| Gemini tools | A | /gemini | 24 hours / related |
| Network chips | A | /chips | 8 days / other |
| Undated article | A | /unknown | invalid / other |
| Missing link | A | absent | skipped |
| Claude update (duplicate) | B | /claude?gclid=b | 2 hours / related |
| Shared headline | B | /one | 2 days / other |
| Shared headline | B | /two | 2 days / other |
| Future Claude | B | /future | 1 hour in future / related |
| Unsafe link | B | javascript scheme | skipped |
| Old model | C | /old | 31 days / related |
| Boundary model | C | /weekly | exactly 7 days / related |
| Monthly model | C | /monthly | exactly 30 days / related |

Ensure related examples contain a current keyword in title/description (e.g.
`model` in the Gemini description); source names are simply A/B/C.

Expected with a fixed reference clock: 10 unique articles; All time 10; Past 24
hours 2; Past 7 days 5; Past 30 days 7. The boundary examples belong in unit checks;
browser receipt latency may move an exact-boundary item outside its window.
Browser fixture variants should put those articles one minute inside their window
while keeping their unit-test counterparts exactly at the boundary.

1. Search ` CLAUDE `: two matches including Future Claude in All time.
2. Add Past 24 hours: one match. Select source B: the merged Claude card remains.
3. Select Other Tech News: zero matches, correct empty message, directory intact.
4. Clear filters: 10 articles, two sections, two distinct Shared headline cards.
5. Reload: no filters persist and IDs remain the same for the same URLs.

## Failure and accessibility checks

Stop Vite and restart with each fixture value: `partial` (C fails), `empty`
(successful sources, no articles), `failed` (every source fails), and
`request-error` (HTTP 500). Verify [contract state precedence](contracts/news-discovery.md).
Also inject a malformed response in handler/client-helper tests and assert a
request error rather than a render exception. Legacy payloads without new article
fields must render and filter using their single `source` value.

At 360px and 1280px widths, use Tab/Shift+Tab, type a query, change each select,
clear filters, and open an original article. Check visible focus, accessible names,
polite counts, correct section navigation, and no page-level horizontal overflow.
Check the Network panel: changing filters makes no news requests.

Restart with `NEWS_FIXTURE=large` and perform 20 filter changes on 75 cards.
Record timings, machine/browser context, and whether each settled within 200ms.
Do not substitute a data-only benchmark for the visible interaction check.

## Live smoke check

Stop the fixture server, then:

```powershell
Remove-Item Env:NEWS_FIXTURE -ErrorAction SilentlyContinue
npm run dev
```

Verify live `/api/ai-news` returns the configured source list, the page renders,
and failures are identified. Public feed outages are recorded separately from
deterministic checks. `npm run preview` remains a static build preview and does
not emulate the production API. Restart Vite after server helper edits.

Record implementation results in this document before marking validation tasks
complete. At planning time, all application checks above remain unrun.
