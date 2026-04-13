---
# gpp-mgxf
title: Reduce nested card stacks across workflow screens
status: completed
type: task
priority: normal
created_at: 2026-04-12T18:18:37Z
updated_at: 2026-04-12T21:00:26Z
parent: get-practice-pal-dftm
---

Several pages still stack cards inside cards, creating unnecessary visual layers. Simplify those layouts so sections read as flatter, more direct surfaces.

## Todo
- [ ] Identify remaining card-in-card patterns on sessions, library, setlists, and stats
- [ ] Flatten or remove redundant parent surfaces where they do not add structure
- [x] Verify the result feels lighter without losing grouping clarity

## Summary of Changes

Removed several unnecessary card-within-card layers across sessions, stats, setlists, and section detail screens. Active sessions now use a flatter section stack without an enclosing active-session card, stats no longer nests progress points inside an extra panel or empty side column, and item/exercise/session-history rows now use simpler row surfaces instead of mini cards. Browser validation confirmed the result feels lighter.
