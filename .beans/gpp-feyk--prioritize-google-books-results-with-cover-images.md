---
# gpp-feyk
title: Prioritize Google Books results with cover images
status: completed
type: task
priority: normal
created_at: 2026-04-24T07:03:23Z
updated_at: 2026-04-24T07:04:28Z
---

- [x] Review current Google Books result ordering
- [x] Update ranking to prefer books with cover images
- [x] Verify with targeted tests

Prefer results that include cover images so the library book picker surfaces more useful Google Books matches first.

## Summary of Changes

- Ranked Google Books candidates by available cover image size before returning search results.
- Kept fallback behavior the same while preserving original order among equally ranked candidates.
- Verified with `npm run test:google-books`, `npm run lint`, and `npm run typecheck`.
