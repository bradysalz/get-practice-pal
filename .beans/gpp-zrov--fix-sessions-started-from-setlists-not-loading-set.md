---
# gpp-zrov
title: Fix sessions started from setlists not loading setlist items
status: completed
type: bug
priority: normal
created_at: 2026-04-12T09:05:18Z
updated_at: 2026-04-12T18:19:12Z
parent: get-practice-pal-dftm
---

Starting a session from a setlist should preload the setlist items into the active session, but the current flow does not appear to do that reliably.

## Todo
- [x] Trace the session start flow for setlist-backed sessions
- [x] Fix preloading so setlist items appear in the new active session
- [x] Verify the behavior in the browser before finalizing

## Summary of Changes

Fixed session startup from setlists so setlist items are copied into the new active session with seeded tempos and correct ordering.
