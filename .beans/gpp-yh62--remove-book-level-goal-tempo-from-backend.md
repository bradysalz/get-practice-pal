---
# gpp-yh62
title: Remove book-level goal tempo from backend
status: completed
type: feature
priority: normal
created_at: 2026-04-12T08:08:50Z
updated_at: 2026-04-14T06:38:39Z
parent: get-practice-pal-9v26
---

Book-level goal tempo adds noise to the library flow and should be removed from the data model and backend APIs in a later pass.

## Scope
- Remove book default goal tempo from schema and services
- Update frontend forms and stats assumptions accordingly
- Plan migration for existing data

## Summary of Changes

Removed book-level default goal tempo from the backend code path, added a migration to drop `books.default_goal_tempo`, and verified only section-level tempo handling remains in the active app code. The migration has been applied in Supabase.
