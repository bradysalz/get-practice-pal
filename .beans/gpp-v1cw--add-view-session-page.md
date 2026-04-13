---
# gpp-v1cw
title: Add view session page
status: completed
type: feature
priority: normal
created_at: 2026-04-13T07:04:35Z
updated_at: 2026-04-13T08:21:09Z
parent: gpp-1qyh
---

Add a dedicated page for viewing past sessions in detail instead of limiting session history to summary rows.

## Todo
- [x] Add a route for viewing an individual past session
- [x] Show logged items, notes, timing, and source setlist context when present
- [x] Link recent session rows into the detail page

## Summary of Changes\n\nAdded the /sessions/[sessionId] route, linked recent sessions into the detail view, and built a dedicated past-session layout that surfaces timing, notes, logged items, and source setlist context more clearly than the list row view.
