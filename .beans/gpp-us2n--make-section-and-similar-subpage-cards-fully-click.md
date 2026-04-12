---
# gpp-us2n
title: Make section and similar subpage cards fully clickable
status: completed
type: task
priority: normal
created_at: 2026-04-12T18:18:37Z
updated_at: 2026-04-12T21:06:00Z
parent: get-practice-pal-dftm
---

Navigation into deeper detail pages should be as easy as the library book cards. Extend whole-card click targets to sections and similar drill-in rows where it improves flow.

## Todo
- [ ] Identify subpage entry rows that still rely on small text buttons
- [ ] Expand those rows into larger click targets while preserving secondary actions
- [x] Verify navigation feels faster on desktop and mobile

## Summary of Changes

Updated the book section list so section cards themselves are the drill-in target instead of relying on small inline buttons. Removed the preview/details affordance and extra metadata from those rows, keeping only the section title and exercise count. Browser verification confirmed this flow felt right.
