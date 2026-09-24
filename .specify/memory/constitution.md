# AI Updates Project Principles

## Core Principles

### I. Useful access to news

Prioritize articles readers can access without paying. Preserve source attribution
and original links. Describe access uncertainty honestly; a feed response is not
proof that a full article is free. This follows the user's source-selection goal.

### II. Reuse the existing application

Prefer the existing React, Vite, JavaScript, Axios, and RSS parser architecture
for the first release. Add infrastructure only when a selected feature needs it.
Keep current news sections and the source directory usable during incremental changes.

### III. Failures should be understandable

Retain successful source results when another source fails. Distinguish request
failures, source failures, empty sources, and filters with no matches.
Never present a shortened RSS description as an AI-generated or full-article summary.

### IV. Build in reviewable releases

Define observable acceptance scenarios before implementation. Preserve the current
API response fields during the first release. Validate data transformations and
API failure behavior with focused checks, and validate reading flows in a browser.

## Scope and Workflow

These principles record existing architecture and user goals that guide the
proposed roadmap. Detailed behavior belongs in each feature spec. Subscriptions,
persistent services, and generated summaries need later release design that
addresses costs and operating requirements.

## Governance

Update these principles when project goals change; keep affected specs and plans
aligned. This document introduces no additional approval process.

**Version**: 1.0.0 | **Recorded**: 2026-09-12 | **Last Amended**: 2026-09-12
