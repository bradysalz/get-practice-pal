---
# gpp-7apt
title: Add drag-and-drop ordering for rows and lists
status: completed
type: feature
priority: normal
created_at: 2026-04-12T18:18:37Z
updated_at: 2026-04-12T23:05:57Z
parent: get-practice-pal-dftm
---

After position fields are removed from the UI, replace manual ordering with direct manipulation. Add drag-and-drop ordering for rows and lists where order matters, including removing visible slot/order fields from session item editing and hidden section ordering metadata from the library list once drag-and-drop exists.

## Todo
- [x] Define drag-and-drop targets for sessions, setlists, and library ordering flows
- [x] Implement persistence for reordered rows
- [x] Verify drag-and-drop works reliably on desktop and acceptable on touch devices

## Summary of Changes

Implemented `dnd-kit` vertical sortable lists for book sections, setlist items, and active session items, backed by server-side reorder actions that persist the updated order. The earlier raw position UI has been replaced by drag handles and direct manipulation while preserving existing links and inline controls. Browser verification confirmed the interaction works and feels good.
