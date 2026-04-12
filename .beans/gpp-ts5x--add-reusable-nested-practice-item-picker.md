---
# gpp-ts5x
title: Add reusable nested practice item picker
status: completed
type: feature
priority: normal
created_at: 2026-04-12T01:27:34Z
updated_at: 2026-04-12T02:49:13Z
---

Build a reusable nested selector component that later session and setlist flows can use to choose exercises and songs.

## Scope
- Nested rendering for books -> sections -> exercises and artists -> songs
- Search/filter support
- Selection affordances and summary
- Initial integration on the library page

## Summary of Changes

Built a reusable nested practice item picker with hierarchical library rendering, search support, and selection summary. Integrated the picker into the library flow and reused the same library item mapping approach for sessions and setlists.
